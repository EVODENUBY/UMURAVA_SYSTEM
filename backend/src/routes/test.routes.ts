import { Router, Request, Response } from 'express';
import Job from '../models/job.model';
import ExternalApplicant from '../models/externalApplicant.model';
import InternalApplicant from '../models/internalApplicant.model';
import Applicant from '../models/applicant.model';
import aiService from '../services/ai.service';
import scoringService from '../services/scoring.service';
import { protect, authorize } from '../middlewares/auth.middleware';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/test/screening:
 *   get:
 *     summary: Test screening UI - list jobs with applicant counts
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: HTML test page
 */
router.get('/screening', async (_req, res: Response) => {
  try {
    const jobs = await Job.find().limit(20).select('title _id status');
    
    const jobList = await Promise.all(jobs.map(async (job) => {
      const [externalCount, internalCount] = await Promise.all([
        ExternalApplicant.countDocuments({ jobId: job._id }),
        InternalApplicant.countDocuments({ jobId: job._id })
      ]);
      return { ...job.toObject(), applicantCount: externalCount + internalCount };
    }));

    const jobsHtml = jobList.length > 0 
      ? jobList.map(j => `<option value="${j._id}">${j.title} (${j.applicantCount} applicants)</option>`).join('')
      : '<option>No jobs available - create a job first</option>';

    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>🎯 AI Screening Test</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #f8fafc; }
    h1 { color: #4F46E5; margin-bottom: 10px; }
    .subtitle { color: #64748b; margin-bottom: 30px; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
    label { font-weight: 600; display: block; margin-bottom: 8px; }
    select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 16px; margin-bottom: 20px; }
    button { background: #4F46E5; color: white; padding: 14px 28px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; }
    button:hover { background: #4338ca; }
    button:disabled { background: #94a3b8; cursor: not-allowed; }
    #result { margin-top: 20px; padding: 20px; border-radius: 8px; display: none; }
    #result.success { background: #f0fdf4; display: block; }
    #result.error { background: #fef2f2; display: block; }
    #result.loading { background: #fef9c3; display: block; }
    .stat { display: inline-block; margin-right: 30px; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 14px; color: #64748b; }
    .stat.shortlisted .stat-value { color: #10B981; }
    .stat.rejected .stat-value { color: #EF4444; }
    .stat.pending .stat-value { color: #F59E0B; }
    .note { font-size: 14px; color: #64748b; margin-top: 20px; }
    a { color: #4F46E5; }
  </style>
</head>
<body>
  <h1>🎯 AI Screening Test</h1>
  <p class="subtitle">Select a job and run AI screening on all applicants automatically</p>
  
  <div class="card">
    <label>Select Job to Screen:</label>
    <select id="jobSelect" onchange="updateJobInfo()">
      <option value="">-- Select a job --</option>
      ${jobsHtml}
    </select>
    <p style="font-size: 13px; color: #64748b;">Request body: <code>{"jobId": "SELECTED_JOB_ID", "threshold": 50}</code></p>
    <button id="runBtn" onclick="runScreening()" disabled>▶ Run AI Screening</button>
  </div>
  
  <div id="result"></div>
  
  <p class="note">
    <a href="/api-docs">📚 API Docs</a> | 
    <a href="/">🏠 Home</a>
  </p>
  
  <script>
    const jobs = ${JSON.stringify(jobList)};
    
    function updateJobInfo() {
      const jobId = document.getElementById('jobSelect').value;
      document.getElementById('runBtn').disabled = !jobId;
    }
    
    async function runScreening() {
      const jobId = document.getElementById('jobSelect').value;
      const btn = document.getElementById('runBtn');
      const result = document.getElementById('result');
      
      if (!jobId) { alert('Please select a job'); return; }
      
      btn.disabled = true;
      btn.textContent = '⏳ Running AI Screening...';
      result.className = 'loading';
      result.innerHTML = '<h3>🔄 Processing with AI...</h3><p>Analyzing candidates, this may take a moment...</p>';
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          result.className = 'error';
          result.innerHTML = '<h3>🔐 Authentication Required</h3><p>Please login first at <a href="/login">/login</a> to get a token, or enter your token below:</p><input id="manualToken" placeholder="Paste JWT token here" style="width: 100%; padding: 10px; margin: 10px 0;"><button onclick="retryWithToken()">Try Again</button>';
          return;
        }
        
        const res = await fetch('/api/screening/run', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ jobId, threshold: 0 })
        });
        
        if (!res.ok) {
          const errText = await res.text();
          throw new Error('Server error: ' + res.status + ' - ' + errText);
        }
        
        const data = await res.json();
        
        if (data.success) {
          result.className = 'success';
          result.innerHTML = '<h3>✅ Screening Complete!</h3>' +
            '<p><strong>Job:</strong> ' + data.data.jobTitle + '</p>' +
            '<div class="stat"><div class="stat-value">' + data.data.summary.totalCandidates + '</div><div class="stat-label">Total</div></div>' +
            '<div class="stat shortlisted"><div class="stat-value">' + data.data.summary.shortlistedCount + '</div><div class="stat-label">Shortlisted</div></div>' +
            '<div class="stat rejected"><div class="stat-value">' + data.data.summary.rejectedCount + '</div><div class="stat-label">Rejected</div></div>' +
            '<div class="stat pending"><div class="stat-value">' + data.data.summary.pendingCount + '</div><div class="stat-label">Pending</div></div>';
        } else {
          result.className = 'error';
          result.innerHTML = '<h3>❌ Error</h3><p>' + (data.error?.message || 'Unknown error') + '</p>';
        }
      } catch (e) {
        result.className = 'error';
        result.innerHTML = '<h3>❌ Error</h3><p>' + e.message + '</p>';
      }
      
      btn.disabled = false;
      btn.textContent = '▶ Run AI Screening';
    }
  </script>
</body>
</html>
    `);
  } catch (error) {
    res.send('Error: ' + error.message);
  }
});

export default router;