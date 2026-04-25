import { EvaluationResult } from './ai.service';
import Result, { IResult, IBiasAlert } from '../models/result.model';
import logger from '../utils/logger';

export interface RankedCandidate extends EvaluationResult {
  ranking: number;
  status: 'shortlisted' | 'rejected' | 'interview' | 'pending';
}

export interface ScoringOptions {
  threshold?: number;
  topN?: number;
  autoShortlist?: boolean;
  shortlistThreshold?: number;
}

export class ScoringService {
  private readonly DEFAULT_THRESHOLD = 50;
  private readonly DEFAULT_SHORTLIST_THRESHOLD = 75;

  /**
   * Rank candidates based on their scores
   */
  rankCandidates(evaluations: EvaluationResult[], options: ScoringOptions = {}): RankedCandidate[] {
    const { 
      threshold = this.DEFAULT_THRESHOLD, 
      topN,
      autoShortlist = false,
      shortlistThreshold = this.DEFAULT_SHORTLIST_THRESHOLD
    } = options;

    logger.info('Ranking candidates', { 
      totalCandidates: evaluations.length,
      threshold,
      topN 
    });

    if (evaluations.length === 0) {
      logger.warn('No evaluations provided for ranking');
      return [];
    }

    const sortedEvaluations = [...evaluations].sort((a, b) => b.score - a.score);

    let filteredEvaluations = sortedEvaluations;
    
    if (topN && topN > 0) {
      filteredEvaluations = filteredEvaluations.slice(0, topN);
    }

    let rankingCounter = 1;
    const ranked: RankedCandidate[] = filteredEvaluations.map((evaluation) => {
      let status: 'shortlisted' | 'rejected' | 'interview' | 'pending' = 'pending';

      if (autoShortlist) {
        if (evaluation.score >= shortlistThreshold) {
          status = 'shortlisted';
        } else if (evaluation.score < threshold) {
          status = 'rejected';
        } else {
          status = 'pending';
        }
      }

      return {
        ...evaluation,
        ranking: rankingCounter++,
        status
      };
    });

    if (ranked.length === 0) {
      throw new Error('Ranking failed: No candidates could be ranked');
    }

    logger.info('Candidates ranked successfully', { 
      rankedCount: ranked.length,
      shortlisted: ranked.filter(r => r.status === 'shortlisted').length,
      firstRanking: ranked[0]?.ranking,
      lastRanking: ranked[ranked.length - 1]?.ranking
    });

    return ranked;
  }

  /**
   * Save screening results to database
   */
  async saveResults(
    jobId: string,
    rankedCandidates: RankedCandidate[],
    biasAlerts: IBiasAlert[]
  ): Promise<IResult[]> {
    try {
      logger.info('Saving screening results', { jobId, candidateCount: rankedCandidates.length });

      const savePromises = rankedCandidates.map(async (candidate) => {
        // Check if result already exists
        const existingResult = await Result.findOne({
          jobId,
          applicantId: candidate.candidateId
        });

        const resultData = {
          jobId,
          applicantId: candidate.candidateId,
          score: candidate.score,
          strengths: candidate.strengths,
          gaps: candidate.gaps,
          reasoning: candidate.reasoning,
          biasAlerts,
          matchDetails: candidate.matchDetails,
          ranking: candidate.ranking,
          status: candidate.status
        };

        if (existingResult) {
          // Update existing result
          Object.assign(existingResult, resultData);
          return existingResult.save();
        } else {
          // Create new result
          return Result.create(resultData);
        }
      });

      const savedResults = await Promise.all(savePromises);

      logger.info('Results saved successfully', { count: savedResults.length });

      return savedResults;
    } catch (error) {
      logger.error('Error saving results:', error);
      throw new Error(`Failed to save results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get aggregated statistics for a job's screening results
   */
  async getJobStatistics(jobId: string): Promise<{
    totalCandidates: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    shortlistedCount: number;
    rejectedCount: number;
    pendingCount: number;
    interviewCount: number;
    biasAlertCount: number;
  }> {
    try {
      const results = await Result.find({ jobId });

      if (results.length === 0) {
        return {
          totalCandidates: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          shortlistedCount: 0,
          rejectedCount: 0,
          pendingCount: 0,
          interviewCount: 0,
          biasAlertCount: 0
        };
      }

      const scores = results.map(r => r.score);
      const totalBiasAlerts = results.reduce((sum, r) => sum + r.biasAlerts.length, 0);

      return {
        totalCandidates: results.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        shortlistedCount: results.filter(r => r.status === 'shortlisted').length,
        rejectedCount: results.filter(r => r.status === 'rejected').length,
        pendingCount: results.filter(r => r.status === 'pending').length,
        interviewCount: results.filter(r => r.status === 'interview').length,
        biasAlertCount: totalBiasAlerts
      };
    } catch (error) {
      logger.error('Error getting job statistics:', error);
      throw new Error(`Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update candidate status
   */
  async updateCandidateStatus(
    jobId: string,
    applicantId: string,
    status: 'pending' | 'shortlisted' | 'rejected' | 'interview'
  ): Promise<IResult | null> {
    try {
      const result = await Result.findOneAndUpdate(
        { jobId, applicantId },
        { status },
        { new: true }
      );

      if (result) {
        logger.info('Candidate status updated', { jobId, applicantId, status });
      }

      return result;
    } catch (error) {
      logger.error('Error updating candidate status:', error);
      throw new Error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch update rankings for a job
   */
  async updateRankings(jobId: string): Promise<void> {
    try {
      const results = await Result.find({ jobId }).sort({ score: -1 });

      const updatePromises = results.map((result, index) => {
        result.ranking = index + 1;
        return result.save();
      });

      await Promise.all(updatePromises);

      logger.info('Rankings updated', { jobId, count: results.length });
    } catch (error) {
      logger.error('Error updating rankings:', error);
      throw new Error(`Failed to update rankings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get top candidates for a job
   */
  async getTopCandidates(jobId: string, limit: number = 10): Promise<IResult[]> {
    try {
      return Result.find({ jobId })
        .sort({ score: -1 })
        .limit(limit)
        .populate('applicantId', 'name email skills experience education')
        .exec();
    } catch (error) {
      logger.error('Error getting top candidates:', error);
      throw new Error(`Failed to get top candidates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compare multiple candidates
   */
  compareCandidates(candidates: EvaluationResult[]): {
    bestOverall: EvaluationResult | null;
    bestSkills: EvaluationResult | null;
    bestExperience: EvaluationResult | null;
    bestEducation: EvaluationResult | null;
    comparison: Array<{
      candidateId: string;
      score: number;
      skillsMatch: number;
      experienceMatch: number;
      educationMatch: number;
    }>;
  } {
    if (candidates.length === 0) {
      return {
        bestOverall: null,
        bestSkills: null,
        bestExperience: null,
        bestEducation: null,
        comparison: []
      };
    }

    const comparison = candidates.map(c => ({
      candidateId: c.candidateId,
      score: c.score,
      skillsMatch: c.matchDetails.skillsMatch,
      experienceMatch: c.matchDetails.experienceMatch,
      educationMatch: c.matchDetails.educationMatch
    }));

    return {
      bestOverall: candidates.reduce((best, current) => 
        current.score > best.score ? current : best
      ),
      bestSkills: candidates.reduce((best, current) => 
        current.matchDetails.skillsMatch > best.matchDetails.skillsMatch ? current : best
      ),
      bestExperience: candidates.reduce((best, current) => 
        current.matchDetails.experienceMatch > best.matchDetails.experienceMatch ? current : best
      ),
      bestEducation: candidates.reduce((best, current) => 
        current.matchDetails.educationMatch > best.matchDetails.educationMatch ? current : best
      ),
      comparison
    };
  }

  /**
   * Calculate percentile rank for a candidate
   */
  calculatePercentile(candidateScore: number, allScores: number[]): number {
    if (allScores.length === 0) return 0;
    
    const sortedScores = [...allScores].sort((a, b) => a - b);
    const belowCount = sortedScores.filter(score => score < candidateScore).length;
    
    return Math.round((belowCount / sortedScores.length) * 100);
  }
}

export default new ScoringService();
