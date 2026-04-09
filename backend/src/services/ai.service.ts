import { getGeminiModel } from '../config/gemini';
import { IJob } from '../models/job.model';
import { IApplicant } from '../models/applicant.model';
import PromptBuilder, { ScreeningOutput, ChatContext } from '../utils/promptBuilder';
import logger from '../utils/logger';

export interface EvaluationResult {
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

export interface BiasDetectionResult {
  type: 'gender' | 'experience' | 'education' | 'exclusionary' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  originalText?: string;
}

export interface ScreeningResult {
  evaluations: EvaluationResult[];
  biasAlerts: BiasDetectionResult[];
  summary: string;
}

export class AIService {
  /**
   * Safely extract text from Gemini API response
   * Handles different response formats from the Gemini SDK
   */
  private extractResponseText(response: any): string {
    try {
      // Log the response structure for debugging
      logger.debug('Gemini response structure:', { 
        hasText: typeof response.text === 'function',
        hasCandidates: !!response.candidates,
        responseType: typeof response 
      });
      
      // Try the standard text() method first with error handling
      if (typeof response.text === 'function') {
        try {
          const text = response.text();
          if (text && typeof text === 'string') return text;
        } catch (textError) {
          logger.warn('response.text() failed, trying fallback:', textError);
        }
      }
      
      // Fallback: access response structure directly
      if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.candidates[0].content.parts[0].text;
      }
      
      // Another fallback for different SDK versions
      if (response.candidates?.[0]?.output) {
        return response.candidates[0].output;
      }
      
      // Try accessing response directly if it's a string
      if (typeof response === 'string') {
        return response;
      }
      
      logger.error('Unexpected Gemini response structure:', { response });
      throw new Error('Unable to extract text from Gemini response - unexpected response format');
    } catch (error) {
      logger.error('Error extracting response text:', error);
      throw error;
    }
  }
  /**
   * Run AI screening for multiple candidates against a job
   */
  async screenCandidates(job: IJob, applicants: IApplicant[]): Promise<ScreeningResult> {
    try {
      if (applicants.length === 0) {
        throw new Error('No applicants provided for screening');
      }

      logger.info(`Starting AI screening for job ${job._id} with ${applicants.length} candidates`);

      const prompt = PromptBuilder.buildScreeningPrompt(job, applicants);
      const model = getGeminiModel();
      
      const result = await model.generateContent(prompt);
      
      // Handle different SDK versions - result might be the response directly
      const response = result.response || result;
      const responseText = this.extractResponseText(response);

      logger.debug('Raw AI response received', { responseLength: responseText.length });

      // Parse and validate the response
      const parsedOutput: ScreeningOutput = PromptBuilder.parseAIResponse(responseText);

      // Map the parsed output to our internal format
      const evaluations: EvaluationResult[] = parsedOutput.candidates.map(candidate => ({
        candidateId: candidate.candidateId,
        score: Math.round(candidate.score),
        strengths: candidate.strengths || [],
        gaps: candidate.gaps || [],
        reasoning: candidate.reasoning,
        matchDetails: candidate.matchDetails || {
          skillsMatch: 0,
          experienceMatch: 0,
          educationMatch: 0,
          overallMatch: candidate.score
        }
      }));

      const biasAlerts: BiasDetectionResult[] = parsedOutput.biasAlerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        description: alert.description,
        suggestion: alert.suggestion
      }));

      logger.info(`AI screening completed. Evaluated ${evaluations.length} candidates, found ${biasAlerts.length} bias alerts`);

      return {
        evaluations,
        biasAlerts,
        summary: parsedOutput.summary
      };
    } catch (error) {
      logger.error('Error in AI screening:', error);
      throw new Error(`AI screening failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect bias in a job description
   */
  async detectBiasInJob(job: IJob): Promise<BiasDetectionResult[]> {
    try {
      logger.info(`Running bias detection for job ${job._id}`);

      const prompt = PromptBuilder.buildBiasDetectionPrompt(job);
      const model = getGeminiModel();
      
      const result = await model.generateContent(prompt);
      
      // Handle different SDK versions - result might be the response directly
      const response = result.response || result;
      const responseText = this.extractResponseText(response);

      // Parse the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsed = JSON.parse(jsonString);

      const biasAlerts: BiasDetectionResult[] = (parsed.biasAlerts || []).map((alert: BiasDetectionResult) => ({
        type: alert.type,
        severity: alert.severity,
        description: alert.description,
        suggestion: alert.suggestion,
        originalText: alert.originalText
      }));

      logger.info(`Bias detection completed. Found ${biasAlerts.length} potential issues`);

      return biasAlerts;
    } catch (error) {
      logger.error('Error in bias detection:', error);
      throw new Error(`Bias detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate chat response for recruiter questions
   */
  async generateChatResponse(message: string, context?: ChatContext): Promise<string> {
    try {
      logger.info('Generating chat response', { messageLength: message.length });

      const prompt = PromptBuilder.buildChatPrompt(message, context);
      const model = getGeminiModel();
      
      const result = await model.generateContent(prompt);
      
      // Handle different SDK versions - result might be the response directly
      const response = result.response || result;
      const responseText = this.extractResponseText(response);

      logger.debug('Chat response generated', { responseLength: responseText.length });

      return responseText.trim();
    } catch (error) {
      logger.error('Error generating chat response:', error);
      throw new Error(`Chat response generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse resume text using AI
   */
  async parseResume(resumeText: string): Promise<{
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: {
      years: number;
      currentRole?: string;
      previousRoles?: Array<{ title: string; company: string; duration: string }>;
    };
    education: Array<{ degree: string; institution: string; year: number; field?: string }>;
  }> {
    try {
      logger.info('Parsing resume with AI');

      const prompt = `Extract structured information from the following resume. Return ONLY a valid JSON object with this exact structure:

Resume Text:
"""
${resumeText}
"""

Return JSON:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number (optional)",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": {
    "years": 5,
    "currentRole": "Current Job Title (optional)",
    "previousRoles": [
      {"title": "Job Title", "company": "Company Name", "duration": "2020-2022"}
    ]
  },
  "education": [
    {"degree": "Bachelor of Science", "institution": "University Name", "year": 2020, "field": "Computer Science"}
  ]
}

Instructions:
- Extract all skills mentioned in the resume
- Calculate total years of experiences
- Identify current/most recent role
- List previous roles with company and duration
- Extract all education entries
- If any field is not found, use empty string for strings, empty array for arrays, or 0 for numbers
- Return ONLY the JSON object, no markdown, no explanation`;

      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      
      // Handle different SDK versions - result might be the response directly
      const response = result.response || result;
      const responseText = this.extractResponseText(response);

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      const parsed = JSON.parse(jsonString);

      logger.info('Resume parsed successfully', { name: parsed.name });

      return {
        name: parsed.name || 'Unknown',
        email: parsed.email || '',
        phone: parsed.phone,
        skills: parsed.skills || [],
        experience: parsed.experience || { years: 0 },
        education: parsed.education || []
      };
    } catch (error) {
      logger.error('Error parsing resume:', error);
      throw new Error(`Resume parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch process multiple resumes for efficiency
   */
  async batchParseResumes(resumeTexts: Array<{ id: string; text: string }>): Promise<Array<{
    id: string;
    parsed: {
      name: string;
      email: string;
      phone?: string;
      skills: string[];
      experience: {
        years: number;
        currentRole?: string;
        previousRoles?: Array<{ title: string; company: string; duration: string }>;
      };
      education: Array<{ degree: string; institution: string; year: number; field?: string }>;
    };
  }>> {
    const results = [];
    
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < resumeTexts.length; i += batchSize) {
      const batch = resumeTexts.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async ({ id, text }) => {
          try {
            const parsed = await this.parseResume(text);
            return { id, parsed };
          } catch (error) {
            logger.error(`Failed to parse resume ${id}:`, error);
            return {
              id,
              parsed: {
                name: 'Parse Error',
                email: '',
                skills: [],
                experience: { years: 0 },
                education: []
              }
            };
          }
        })
      );
      
      results.push(...batchResults);
    }
    
    return results;
  }
}

export default new AIService();
