import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';
import Job from '../models/job.model';
import InternalApplicant from '../models/internalApplicant.model';
import ExternalApplicant from '../models/externalApplicant.model';
import Result from '../models/result.model';
import User from '../models/user.model';

const router = Router();

router.post('/seed-test-data', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({}).limit(3);
    
    if (jobs.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No jobs found. Create jobs first.' } });
    }

    const jobIds = jobs.map((j: any) => j._id);
    const users = await User.find({ role: 'applicant' }).limit(10);
    const userIds = users.map((u: any) => u._id);

    const results = [];

    for (let i = 0; i < 5; i++) {
      const jobId = jobIds[i % jobIds.length];
      
      const internalApp = await InternalApplicant.create({
        jobId,
        userId: userIds[i % userIds.length],
        status: 'applied',
        appliedAt: new Date()
      });
      results.push({ model: 'InternalApplicant', id: internalApp._id });
    }

    for (let i = 0; i < 5; i++) {
      const jobId = jobIds[i % jobIds.length];
      
      const externalApp = await ExternalApplicant.create({
        jobId,
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@example.com`,
        phone: `+25078900000${i}`,
        status: 'screening',
        appliedAt: new Date()
      });
      results.push({ model: 'ExternalApplicant', id: externalApp._id });
    }

    for (let i = 0; i < 3; i++) {
      const jobId = jobIds[i % jobIds.length];
      
      const externalApp2 = await ExternalApplicant.create({
        jobId,
        name: `Shortlisted Candidate ${i + 1}`,
        email: `shortlisted${i + 1}@example.com`,
        phone: `+25078910000${i}`,
        status: 'shortlisted',
        appliedAt: new Date()
      });
      results.push({ model: 'ExternalApplicant', id: externalApp2._id });
    }

    for (let i = 0; i < 2; i++) {
      const jobId = jobIds[i % jobIds.length];
      
      const externalApp3 = await ExternalApplicant.create({
        jobId,
        name: `Interview Candidate ${i + 1}`,
        email: `interview${i + 1}@example.com`,
        phone: `+25078920000${i}`,
        status: 'interview',
        appliedAt: new Date()
      });
      results.push({ model: 'ExternalApplicant', id: externalApp3._id });
    }

    for (let i = 0; i < 2; i++) {
      const jobId = jobIds[i % jobIds.length];
      
      const externalApp4 = await ExternalApplicant.create({
        jobId,
        name: `Offer Candidate ${i + 1}`,
        email: `offer${i + 1}@example.com`,
        phone: `+25078930000${i}`,
        status: 'offer',
        appliedAt: new Date()
      });
      results.push({ model: 'ExternalApplicant', id: externalApp4._id });
    }

    for (let i = 0; i < 2; i++) {
      const jobId = jobIds[i % jobIds.length];
      
      const externalApp5 = await ExternalApplicant.create({
        jobId,
        name: `Hired Candidate ${i + 1}`,
        email: `hired${i + 1}@example.com`,
        phone: `+25078940000${i}`,
        status: 'hired',
        appliedAt: new Date()
      });
      results.push({ model: 'ExternalApplicant', id: externalApp5._id });
    }

    const totalInternal = await InternalApplicant.countDocuments({});
    const totalExternal = await ExternalApplicant.countDocuments({});
    const totalApplicants = totalInternal + totalExternal;

    res.json({
      success: true,
      data: {
        message: 'Test data seeded successfully',
        totalCreated: results.length,
        breakdown: {
          internal: { applied: 5 },
          external: { 
            screening: 5,
            shortlisted: 3,
            interview: 2,
            offer: 2,
            hired: 2
          }
        },
        totals: {
          totalInternal,
          totalExternal,
          totalApplicants
        }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: { message: 'Error seeding data' } });
  }
});

export default router;