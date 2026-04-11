import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBiasAlert {
  type: 'gender' | 'experience' | 'experience_requirement' | 'education' | 'education_requirement' | 'exclusionary' | 'age' | 'assessment_data' | 'data_limitation' | 'data_quality_or_generic_resume' | 'data_completeness' | 'geographic_location' | 'resume_detail' | 'language' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface IResult extends Document {
  jobId: Types.ObjectId;
  applicantId: Types.ObjectId;
  score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  biasAlerts: IBiasAlert[];
  matchDetails: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    overallMatch: number;
  };
  ranking?: number;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview';
  createdAt: Date;
  updatedAt: Date;
}

const BiasAlertSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['gender', 'experience', 'experience_requirement', 'education', 'education_requirement', 'exclusionary', 'age', 'assessment_data', 'data_limitation', 'data_quality_or_generic_resume', 'data_completeness', 'geographic_location', 'resume_detail', 'language', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  suggestion: {
    type: String,
    required: true
  }
});

const ResultSchema: Schema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'Applicant',
      required: [true, 'Applicant ID is required'],
      index: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100']
    },
    strengths: {
      type: [String],
      default: []
    },
    gaps: {
      type: [String],
      default: []
    },
    reasoning: {
      type: String,
      required: [true, 'Reasoning is required']
    },
    biasAlerts: {
      type: [BiasAlertSchema],
      default: []
    },
    matchDetails: {
      skillsMatch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      experienceMatch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      educationMatch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      overallMatch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    ranking: {
      type: Number,
      min: 1
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'interview'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for unique job-applicant pairs
ResultSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
ResultSchema.index({ jobId: 1, score: -1 });
ResultSchema.index({ status: 1 });

export default mongoose.model<IResult>('Result', ResultSchema);
