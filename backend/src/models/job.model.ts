import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  jobLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  requiredSkills: string[];
  responsibilities?: string[];
  experience?: string;
  education: {
    degree: string;
    field?: string;
    required: boolean;
  }[];
  certifications?: string[];
  languages?: string[];
  location?: {
    address?: string;
    city?: string;
    country?: string;
    remote?: boolean;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  } | null;
  benefits?: string[];
  applicationProcess?: {
    steps?: string[];
  };
  tags?: string[];
  createdBy: Types.ObjectId;
  status: 'draft' | 'published' | 'closed' | 'archived';
  applicationDeadline?: Date;
  expirationDate?: Date;
  postedDate?: Date;
  analytics: {
    applications: number;
    shortlisted: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time'
    },
    jobLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill is needed'],
      validate: {
        validator: (skills: string[]) => skills.length > 0,
        message: 'At least one skill is required'
      }
    },
    responsibilities: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      trim: true
    },
    education: [{
      degree: {
        type: String,
        required: [true, 'Education degree requirement is required']
      },
      field: {
        type: String
      },
      required: {
        type: Boolean,
        default: true
      }
    }],
    certifications: [{
      type: String,
      trim: true
    }],
    languages: [{
      type: String,
      trim: true
    }],
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, trim: true },
      remote: { type: Boolean, default: false }
    },
    salary: {
      type: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'USD' }
      },
      default: null
    },
    benefits: [{
      type: String,
      trim: true
    }],
    applicationProcess: {
      steps: [{
        type: String,
        trim: true
      }]
    },
    tags: [{
      type: String,
      trim: true
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft'
    },
    applicationDeadline: {
      type: Date
    },
    expirationDate: {
      type: Date
    },
    postedDate: {
      type: Date
    },
    analytics: {
      applications: { type: Number, default: 0 },
      shortlisted: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

JobSchema.virtual('countdown').get(function (this: IJob): { expired: boolean; daysRemaining: number; hoursRemaining: number; endDate?: Date } | null {
  if (this.status === 'draft') return null;
  
  const now = new Date();
  const endDate = this.expirationDate || this.applicationDeadline || this.createdAt;
  if (!endDate) return null;
  
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return { expired: true, daysRemaining: 0, hoursRemaining: 0 };
  
  const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { expired: false, daysRemaining, hoursRemaining, endDate };
});

JobSchema.index({ title: 'text', description: 'text', tags: 'text' });
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ createdBy: 1, status: 1 });
JobSchema.index({ status: 1, applicationDeadline: 1 });

export default mongoose.model<IJob>('Job', JobSchema);