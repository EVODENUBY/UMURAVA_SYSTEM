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
}

export interface BiasAlert {
  type: 'gender' | 'experience' | 'education' | 'exclusionary' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface ScreeningOutput {
  candidates: CandidateEvaluation[];
  biasAlerts: BiasAlert[];
  summary: string;
}

export interface ChatContext {
  job?: IJob;
  candidates?: IApplicant[];
  results?: CandidateEvaluation[];
}

export class PromptBuilder {
  /**
   * Build a screening prompt for evaluating multiple candidates against a job
   */
  static buildScreeningPrompt(job: IJob, applicants: IApplicant[]): string {
    const jobContext = this.formatJobContext(job);
    const candidatesContext = applicants.map((a, index) => 
      this.formatCandidateContext(a, index + 1)
    ).join('\n\n---\n\n');

    return `You are an AI recruitment assistant. Your task is to evaluate candidates against a job description and provide structured, unbiased assessments.

## JOB DESCRIPTION
${jobContext}

## CANDIDATES TO EVALUATE
${candidatesContext}

## YOUR TASK
Evaluate each candidate objectively against the job requirements. Provide:
1. An overall match score (0-100)
2. Specific strengths that match the job
3. Gaps or areas where they don't match
4. Detailed reasoning for your assessment
5. Match breakdown: skills, experience, education

## BIAS DETECTION
Analyze the job description and candidate evaluations for potential biases:
- Gender bias (gendered language, unequal expectations)
- Experience bias (unreasonable experience requirements)
- Education bias (over-emphasis on degrees vs skills)
- Exclusionary bias (language that might exclude certain groups)

## OUTPUT FORMAT
Return ONLY a valid JSON object with this exact structure:
{
  "candidates": [
    {
      "candidateId": "${applicants[0]?._id || 'id'}",
      "score": 85,
      "strengths": ["strength 1", "strength 2"],
      "gaps": ["gap 1", "gap 2"],
      "reasoning": "Detailed explanation of the assessment",
      "matchDetails": {
        "skillsMatch": 90,
        "experienceMatch": 80,
        "educationMatch": 85,
        "overallMatch": 85
      }
    }
  ],
  "biasAlerts": [
    {
      "type": "gender|experience|education|exclusionary|other",
      "severity": "low|medium|high",
      "description": "Description of the bias detected",
      "suggestion": "Suggestion to mitigate the bias"
    }
  ],
  "summary": "Brief summary of the overall candidate pool assessment"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting, no code blocks
- Ensure all scores are numbers between 0-100
- Include detailed reasoning for each candidate
- Be objective and fair in assessments
- Identify any potential biases in the process`;
  }

  /**
   * A chat prompt for answering recruiter questions
   */
  static buildChatPrompt(message: string, context?: ChatContext): string {
    let contextPrompt = '';
    
    if (context?.job) {
      contextPrompt += `\n\n## REFERENCE JOB\n${this.formatJobContext(context.job)}`;
    }
    
    if (context?.candidates && context.candidates.length > 0) {
      contextPrompt += `\n\n## REFERENCE CANDIDATES\n${context.candidates.map((c, i) => 
        this.formatCandidateContext(c, i + 1)
      ).join('\n\n---\n\n')}`;
    }

    if (context?.results && context.results.length > 0) {
      contextPrompt += `\n\n## CANDIDATE EVALUATIONS\n${JSON.stringify(context.results, null, 2)}`;
    }

    return `You are an AI recruitment assistant helping a recruiter with their hiring decisions. Provide helpful, professional, and objective responses.

## RECRUITER QUESTION
"${message}"
${contextPrompt}

## YOUR TASK
Answer the recruiter's question based on the context provided. Be:
- Professional and objective
- Specific with data when available
- Honest about limitations
- Actionable in your recommendations

If asked to compare candidates, provide clear comparisons with specific reasons.
If asked about bias concerns, highlight any issues found and suggest improvements.
If no context is provided, give general best-practice advice.

Keep responses concise but informative (2-4 paragraphs maximum unless detailed analysis is requested).`;
  }

  /**
   * Build a bias detection prompt specifically for job descriptions
   */
  static buildBiasDetectionPrompt(job: IJob): string {
    return `Analyze the following job description for potential biases and exclusionary language.

## JOB DESCRIPTION
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requiredSkills.join(', ')}
Experience Required: ${job.experience.minYears}${job.experience.maxYears ? `-${job.experience.maxYears}` : '+'} years (${job.experience.level} level)
Education: ${job.education.map(edu => `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} ${edu.required ? '(Required)' : '(Preferred)'}`).join(', ')}

## BIAS CATEGORIES TO CHECK
1. Gender Bias: Gendered language, pronouns, stereotypical gender traits
2. Experience Bias: Unreasonable requirements that exclude qualified candidates
3. Education Bias: Over-emphasis on formal education vs equivalent experience
4. Exclusionary Language: Jargon, cultural references, ableist language
5. Age Bias: Language that might discriminate based on age

## OUTPUT FORMAT
Return ONLY a valid JSON object:
{
  "biasAlerts": [
    {
      "type": "gender|experience|education|exclusionary|other",
      "severity": "low|medium|high",
      "description": "Specific issue found",
      "suggestion": "How to improve",
      "originalText": "The problematic text from job description"
    }
  ],
  "overallAssessment": "Summary of bias analysis",
  "improvedDescription": "A more inclusive version of the job description"
}`;
  }

  /**
   * Format job data for prompts
   */
  private static formatJobContext(job: IJob): string {
    return `Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.requiredSkills.join(', ')}
Experience: ${job.experience.minYears}${job.experience.maxYears ? `-${job.experience.maxYears}` : '+'} years (${job.experience.level} level)
Education: ${job.education.map(edu => `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} ${edu.required ? '(Required)' : '(Preferred)'}`).join(', ')}
${job.location ? `Location: ${job.location}` : ''}`;
  }

  /**
   * Format candidate data for prompts
   */
  private static formatCandidateContext(applicant: IApplicant, index: number): string {
    const exp = applicant.experience;
    const edu = applicant.education;
    
    return `Candidate #${index} (ID: ${applicant._id})
Name: ${applicant.name}
Email: ${applicant.email}
Skills: ${applicant.skills.join(', ') || 'Not specified'}
Experience: ${exp.years} years${exp.currentRole ? `, Current: ${exp.currentRole}` : ''}
Education: ${edu.map(e => `${e.degree} from ${e.institution} (${e.year})`).join('; ') || 'Not specified'}
Resume Summary: ${applicant.resumeText ? applicant.resumeText.substring(0, 1000) + (applicant.resumeText.length > 1000 ? '...' : '') : 'Not available'}`;
  }

  /**
   * Parse and validate AI response
   */
  static parseAIResponse(responseText: string): ScreeningOutput {
    try {
      // Try to extract JSON from the response (in case there's markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const parsed = JSON.parse(jsonString);
      
      // Validate structure
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
