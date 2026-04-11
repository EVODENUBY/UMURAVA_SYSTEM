import { IJob } from '../models/job.model';
import { IApplicant } from '../models/applicant.model';

export interface CandidateEvaluation {
  candidateId: string;
  score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  matchDetails: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    overallMatch: number;
  };
  confidenceScore: number;
  recommendation: 'Strong Hire' | 'Consider' | 'Borderline' | 'Pass';
}

export interface BiasAlert {
  type: 'gender' | 'experience' | 'education' | 'exclusionary' | 'age' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  originalText?: string;
}

export interface ScreeningOutput {
  candidates: CandidateEvaluation[];
  biasAlerts: BiasAlert[];
  summary: string;
  fraudAnalysis?: {
    candidateId: string;
    riskScore: number;
    flags: string[];
  }[];
}

export interface ChatContext {
  job?: IJob;
  candidates?: (IApplicant | any)[];
  results?: CandidateEvaluation[];
}

export interface SkillGapOutput {
  candidateId: string;
  skillGaps: {
    required: string[];
    missing: string[];
    matching: string[];
  };
  roadmap: {
    shortTerm: { skill: string; resources: string[]; estimatedWeeks: number }[];
    longTerm: { skill: string; resources: string[]; estimatedMonths: number }[];
  };
  timeToReadiness: string;
}

export interface CulturalFitOutput {
  candidateId: string;
  fitScore: number;
  workStyle: 'remote' | 'hybrid' | 'onsite';
  collaborationStyle: 'team' | 'independent' | 'flexible';
  leadershipPotential: 'high' | 'medium' | 'low';
  riskFlags: string[];
  compatibilityNarrative: string;
}

export class PromptBuilder {
  /**
   * Advanced screening prompt with bias-free evaluation and explainable AI
   */
  static buildScreeningPrompt(job: IJob, applicants: IApplicant[]): string {
    const jobContext = this.formatJobContext(job);
    const candidatesContext = applicants.map((a, index) => 
      this.formatCandidateContext(a, index + 1)
    ).join('\n\n---\n\n');

    return `You are an AI Hiring & Talent Intelligence Copilot designed to evaluate candidates FAIRLY, OBJECTIVELY, and WITHOUT BIAS.

## 🎯 CORE PRINCIPLES
- Evaluate based on SKILLS , EDUCATION , EXPERIENCE and JOB FIT, not demographics, age, gender, or background
- Provide TRANSPARENT explanations for every scoring decision
- Use STRUCTURED RUBRIC scoring for consistency
- Flag potential BIASES in your own assessment
- Focus on FUTURE POTENTIAL, not just past experience

## JOB DESCRIPTION
${jobContext}

## CANDIDATES TO EVALUATE
${candidatesContext}

## EVALUATION CRITERIA (Weighted Scoring Model)
1. **Skills Match (40%)**: Technical skills, tools proficiency, domain knowledge
2. **Experience Relevance (30%)**: Years of experience, role similarity, industry background
3. **Education & Certifications (15%)**: Relevant degrees, certifications, continuous learning
4. **Cultural Fit Indicators (15%)**: Communication, problem-solving approach, growth mindset

## SCORING RUBRIC
- 90-100: Exceptional match - Strong Hire
- 75-89: Good match - Consider  
- 60-74: Partial match - Borderline
- Below 60: Not recommended - Pass

## YOUR TASK
For EACH candidate, provide:
1. **Overall Score** (0-100) with confidence level (high/medium/low)
2. **Strengths** - Specific skills/experience that match job requirements
3. **Gaps** - Missing skills or experience gaps
4. **Detailed Reasoning** - Explain WHY with specific examples
5. **Bias Self-Check** - Did you notice any personal biases in your evaluation?
6. **Recommendation** - Strong Hire | Consider | Borderline | Pass

## FRAUD DETECTION
For each candidate, also analyze:
- Experience timeline consistency
- Skill-experience alignment
- Red flags in career progression
- Confidence in authenticity (high/medium/low)

## BIAS DETECTION
Analyze for:
- Gender-neutral language in requirements
- Experience requirements that exclude qualified candidates
- Education requirements that over-emphasize degrees
- Age-related language
- Geographic or cultural bias

## OUTPUT FORMAT
Return ONLY valid JSON:
{
  "candidates": [
    {
      "candidateId": "id",
      "score": 85,
      "confidenceLevel": "high",
      "strengths": ["specfic skill 1", "specific skill 2"],
      "gaps": ["missing skill 1"],
      "reasoning": "Detailed explanation with specific examples",
      "biasSelfCheck": "Any potential bias I noticed in my evaluation",
      "matchDetails": {
        "skillsMatch": 90,
        "experienceMatch": 80,
        "educationMatch": 85,
        "overallMatch": 85
      },
      "recommendation": "Strong Hire",
      "fraudAnalysis": {
        "riskScore": 10,
        "flags": [],
        "confidence": "high"
      }
    }
  ],
  "biasAlerts": [
    {
      "type": "experience",
      "severity": "medium",
      "description": "5+ years required may exclude qualified candidates",
      "suggestion": "Consider equivalent demonstrated experience"
    }
  ],
  "summary": "Objective summary of candidate pool"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks.`;
  }

  /**
   * Interview Simulator - Generate adaptive interview questions
   */
  static buildInterviewPrompt(job: IJob, candidate: IApplicant, roleLevel: string): string {
    return `You are an AI Interview Simulator. Generate adaptive, role-appropriate interview questions.

## JOB DETAILS
Title: ${job.title}
Required Skills: ${job.requiredSkills.join(', ')}
Experience Level: ${job.jobLevel || 'mid'}, ${job.experience || 'Not specified'}
${job.description.substring(0, 500)}

## CANDIDATE PROFILE
Name: ${candidate.name}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.experience.years} years
Current Role: ${candidate.experience.currentRole || 'Not specified'}
Education: ${candidate.education.map(e => e.degree).join(', ')}

## ROLE LEVEL: ${roleLevel} (junior/mid/senior/executive)

## TASK
Generate interview questions that:
1. Start with behavioral questions, move to technical
2. Adapt difficulty based on role level
3. Focus on skills that are REQUIRED for the job
4. Include STAR-method behavioral questions
5. Add role-specific technical questions
6. Include adaptive follow-up questions based on responses

## OUTPUT FORMAT
{
  "interview": {
    "duration": "45 minutes",
    "sections": [
      {
        "name": "Warm-up",
        "questions": [
          {
            "type": "behavioral",
            "question": "Tell me about yourself...",
            "idealResponseLength": "2-3 minutes"
          }
        ]
      },
      {
        "name": "Technical Skills",
        "questions": [
          {
            "type": "technical",
            "difficulty": "appropriate for ${roleLevel}",
            "question": "Describe a project where you...",
            "followUp": "Follow-up question based on response"
          }
        ]
      }
    ]
  },
  "scoringRubric": {
    "technical": "40%",
    "problemSolving": "30%",
    "communication": "20%",
    "cultureFit": "10%"
  }
}`;
  }

  /**
   * Skill Gap & Career Roadmap Engine
   */
  static buildSkillGapPrompt(candidateSkills: string[], jobRequirements: string[]): string {
    return `You are a Skill Gap & Career Roadmap Engine. Analyze gaps and create a learning path.

## CANDIDATE SKILLS
${candidateSkills.join(', ')}

## JOB REQUIREMENTS
${jobRequirements.join(', ')}

## TASK
1. Compare candidate skills to job requirements
2. Identify MATCHING skills (already has)
3. Identify MISSING skills (need to develop)
4. Create a PRIORITIZED learning roadmap
5. Suggest SPECIFIC resources for each skill
6. Estimate time to job-readiness

## OUTPUT FORMAT
{
  "analysis": {
    "matchingSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"],
    "gapPercentage": 35
  },
  "roadmap": {
    "immediate": [
      { "skill": "Python", "priority": 1, "resources": ["Coursera Python", "FreeCodeCamp"], "weeks": 4 }
    ],
    "shortTerm": [
      { "skill": "AWS", "priority": 2, "resources": ["AWS Free Tier", "Udemy Course"], "weeks": 6 }
    ],
    "longTerm": [
      { "skill": "System Design", "priority": 3, "resources": ["Books", "Architecture Patterns"], "months": 3 }
    ]
  },
  "estimatedReadiness": "3-4 months",
  "readinessScore": 65
}`;
  }

  /**
   * AI Cultural Fit Analyzer
   */
  static buildCulturalFitPrompt(candidateProfile: any, companyCulture: string, jobRole: string): string {
    return `You are an AI Cultural Fit Analyzer. Evaluate personality and work-style compatibility.

## CANDIDATE PROFILE
Skills: ${candidateProfile.skills?.join(', ') || 'N/A'}
Experience: ${candidateProfile.experience?.years} years
Background: ${candidateProfile.education?.map((e: any) => e.degree).join(', ') || 'N/A'}

## COMPANY CULTURE
${companyCulture}

## JOB ROLE CONTEXT
${jobRole}

## TASK
Analyze compatibility across:
1. Work environment preference (remote/hybrid/onsite)
2. Team collaboration style (team player/independent/flexible)
3. Leadership potential
4. Communication fit
5. Risk of cultural mismatch

## OUTPUT FORMAT
{
  "fitScore": 78,
  "dimensions": {
    "workStyle": { "preference": "hybrid", "confidence": 85 },
    "collaboration": { "style": "team", "score": 80 },
    "leadership": { "potential": "high", "confidence": 70 },
    "communication": { "style": "assertive", "score": 75 }
  },
  "riskFlags": ["May prefer fully remote", "Strong independent worker"],
  "compatibilityNarrative": "This candidate shows strong alignment with our hybrid culture...",
  "recommendations": ["Highlight remote work flexibility", "Pair with collaborative projects"]
}`;
  }

  /**
   * AI Job Description Generator
   */
  static buildJobDescriptionGeneratorPrompt(title: string, basicRequirements: string[], companyType: string): string {
    return `You are an AI Job Description Generator. Create professional, inclusive job descriptions.

## INPUT
Job Title: ${title}
Basic Requirements: ${basicRequirements.join(', ')}
Company Type: ${companyType}

## TASK
Generate a comprehensive, bias-free job description including:
1. Compelling job summary
2. Key responsibilities (5-7 bullet points)
3. Required skills (technical + soft)
4. Preferred qualifications
5. Benefits and growth opportunities
6. Inclusive, neutral language throughout

## OUTPUT FORMAT
{
  "jobDescription": {
    "summary": "Compelling 2-3 line summary",
    "responsibilities": ["Responsibility 1", "Responsibility 2"],
    "requiredSkills": {
      "technical": ["Skill 1", "Skill 2"],
      "soft": ["Communication", "Problem Solving"]
    },
    "preferred": ["Nice to have 1", "Nice to have 2"],
    "benefits": ["Benefit 1", "Benefit 2"],
    "inclusivityScore": 92
  }
}`;
  }

  /**
   * Predictive Hiring Success Engine
   */
  static buildPredictiveSuccessPrompt(candidate: IApplicant, job: IJob, historicalData: any): string {
    return `You are a Predictive Hiring Success Engine. Estimate candidate performance and retention.

## CANDIDATE
${this.formatCandidateContext(candidate, 1)}

## JOB
${this.formatJobContext(job)}

## HISTORICAL DATA (if available)
Success factors from similar hires: ${historicalData?.successFactors?.join(', ') || 'No data'}
Retention patterns: ${historicalData?.retentionPattern || 'No data'}

## TASK
Predict:
1. Success probability (0-100)
2. Performance prediction
3. Retention likelihood
4. Risk factors
5. Success factors

## OUTPUT FORMAT
{
  "prediction": {
    "successProbability": 78,
    "performancePrediction": "Likely to exceed expectations",
    "retentionLikelihood": "High (24+ months)",
    "riskOfEarlyExit": "Low",
    "confidenceLevel": "medium"
  },
  "successFactors": ["Strong technical foundation", "Proven growth trajectory"],
  "riskFactors": ["May seek promotion quickly"],
  "recommendation": "Proceed with strong confidence"
}`;
  }

  /**
   * Profile Enhancement Assistant
   */
  static buildProfileEnhancementPrompt(profile: any): string {
    return `You are a Real-Time Profile Enhancement Assistant. Guide candidates to better profiles.

## CURRENT PROFILE STATE
Basic Info: ${profile.basicInfo?.firstName} ${profile.basicInfo?.lastName}
Headline: ${profile.basicInfo?.headline || 'Not set'}
Bio: ${profile.basicInfo?.bio ? profile.basicInfo.bio.substring(0, 100) + '...' : 'Not set'}
Skills: ${profile.skills?.length || 0} skills listed
Experience: ${profile.experience?.length || 0} positions
Education: ${profile.education?.length || 0} degrees
Certifications: ${profile.certifications?.length || 0}
Projects: ${profile.projects?.length || 0}

## TASK
Analyze the profile and provide:
1. Live quality score (0-100)
2. Specific missing fields
3. Actionable improvement tips
4. Impact of each improvement
5. Quick wins (high impact, low effort)

## OUTPUT FORMAT
{
  "score": 65,
  "missingFields": ["headline", "certifications"],
  "improvements": [
    { "field": "headline", "tip": "Add a compelling headline", "impact": "High", "effort": "Low" }
  ],
  "quickWins": [
    { "action": "Add LinkedIn URL to social links", "impact": "+5 points" }
  ],
  "nextSteps": ["1. Complete headline", "2. Add 2 certifications", "3. Upload project portfolio"]
}`;
  }

  /**
   * Chat prompt for conversational recruiter assistant
   */
  static buildChatPrompt(message: string, context?: ChatContext): string {
    let contextPrompt = '';
    
    if (context?.job) {
      contextPrompt += `\n\n## REFERENCE JOB\n${this.formatJobContext(context.job)}`;
    }
    
    if (context?.candidates && context.candidates.length > 0) {
      contextPrompt += `\n\n## REFERENCE CANDIDATES\n${context.candidates.map((c: any, i: number) => 
        this.formatCandidateContext(c, i + 1)
      ).join('\n\n---\n\n')}`;
    }

    if (context?.results && context.results.length > 0) {
      contextPrompt += `\n\n## CANDIDATE EVALUATIONS\n${JSON.stringify(context.results, null, 2)}`;
    }

    return `You are a Conversational Recruiter Assistant (AI Hiring Copilot). 

## RECRUITER QUESTION
"${message}"
${contextPrompt}

## RESPONSE GUIDELINES
- Be professional, concise, and actionable
- Use DATA when available (scores, percentages, rankings)
- Provide CLEAR recommendations
- Explain reasoning when comparing candidates
- If uncertain, acknowledge limitations
- Suggest next steps when appropriate

If asked to:
- Compare candidates → Show side-by-side with specific reasons
- Explain decisions → Use the "Explainable AI" format
- Check bias → Highlight any concerns found
- Recommend actions → Be specific and prioritized

Keep responses conversational but informative.`;
  }

  /**
   * Bias Detection specifically for job descriptions
   */
  static buildBiasDetectionPrompt(job: IJob): string {
    return `You are a Bias Detection & Job Description Optimizer.

## JOB DESCRIPTION
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requiredSkills.join(', ')}
Experience: ${job.experience || 'Not specified'} (${job.jobLevel || 'mid'} level)
Education: ${job.education.map(edu => `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`).join(', ')}

## BIAS CATEGORIES
1. **Gender Bias**: gendered pronouns, gendered adjectives, unequal requirements
2. **Experience Bias**: Excessive years requirements, unnecessary certifications
3. **Education Bias**: Degree requirements that could be replaced by demonstrated skills
4. **Age Bias**: Terms like "young", "energetic", "digital native"
5. **Exclusionary**: Jargon, cultural references, ableist language
6. **Geographic**: Location requirements that could exclude qualified candidates

## TASK
1. Detect ALL potential biases
2. Rate severity (low/medium/high)
3. Provide INCLUSIVE alternatives
4. Calculate INCLUSIVITY SCORE (0-100)
5. Generate OPTIMIZED version

## OUTPUT FORMAT
{
  "biasAlerts": [
    {
      "type": "experience",
      "severity": "high",
      "description": "5+ years experience required may exclude qualified candidates",
      "originalText": "5+ years experience required",
      "suggestion": "Equivalent demonstrated experience accepted"
    }
  ],
  "inclusivityScore": 72,
  "optimizedDescription": "The rewritten job description with neutral language"
}`;
  }

  /**
   * Format job data for prompts
   */
  private static formatJobContext(job: IJob): string {
    return `Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requiredSkills.join(', ')}
Experience: ${job.experience || 'Not specified'} (${job.jobLevel || 'mid'} level)
Education: ${job.education.map(edu => `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} ${edu.required ? '(Required)' : '(Preferred)'}`).join(', ')}
${job.location ? `Location: ${job.location}` : ''}`;
  }

  /**
   * Format candidate data for prompts
   */
  private static formatCandidateContext(applicant: IApplicant, index: number): string {
    const exp = applicant.experience;
    const edu = applicant.education;
    
    // Get additional fields if available (for external applicants with detailed data)
    const skillDetails = (applicant as any).skillDetails || [];
    const languages = (applicant as any).languages || [];
    const resumeLink = (applicant as any).resumeLink || '';
    
    // Format skills with levels if available
    let skillsText = '';
    if (skillDetails.length > 0) {
      skillsText = skillDetails.map((s: any) => `${s.name} (${s.level}, ${s.yearsOfExperience}yrs)`).join(', ');
    } else {
      skillsText = applicant.skills.join(', ') || 'Not specified';
    }
    
    // Format languages if available
    let languagesText = '';
    if (languages.length > 0) {
      languagesText = languages.map((l: any) => `${l.name} (${l.proficiency})`).join(', ');
    }
    
    return `Candidate #${index} (ID: ${applicant._id})
Name: ${applicant.name}
Email: ${applicant.email}
Skills: ${skillsText}${skillDetails.length > 0 ? ` [${skillDetails.length} skills with levels]` : ''}
Experience: ${exp.years} years${exp.currentRole ? `, Current: ${exp.currentRole}` : ''}${exp.previousRoles ? `, Previous: ${exp.previousRoles.map((p: any) => `${p.title} at ${p.company} (${p.duration})`).join('; ')}` : ''}
Education: ${edu.map(e => `${e.degree}${e.field ? ` in ${e.field}` : ''} from ${e.institution} (${e.year})`).join('; ') || 'Not specified'}${languagesText ? `\nLanguages: ${languagesText}` : ''}
${resumeLink ? `Resume Link: ${resumeLink}` : ''}
Resume: ${applicant.resumeText ? applicant.resumeText.substring(0, 1000) + (applicant.resumeText.length > 1000 ? '...[truncated]' : '') : 'Not available'}`;
  }

  /**
   * Parse AI response
   */
  static parseAIResponse(responseText: string): ScreeningOutput {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsed = JSON.parse(jsonString);
      
      if (!parsed.candidates || !Array.isArray(parsed.candidates)) {
        throw new Error('Invalid response: candidates array missing');
      }
      
      return {
        candidates: parsed.candidates,
        biasAlerts: parsed.biasAlerts || [],
        summary: parsed.summary || 'No summary provided'
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default PromptBuilder;