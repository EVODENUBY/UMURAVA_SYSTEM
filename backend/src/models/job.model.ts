import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requiredSkills: string[];
  experience: {
    minYears: number;
    maxYears?: number;
    level: 'entry' | 'mid' | 'senior' | 'executive';
  };
  education: {
    degree: string;
    field?: string;
    required: boolean;
  }[];
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
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
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill is needed'],
      validate: {
        validator: (skills: string[]) => skills.length > 0,
        message: 'At least one skill is required'
      }
    },
    experience: {
      minYears: {
        type: Number,
        required: [true, 'Minimum years of experience is required'],
        min: [0, 'Minimum years cannot be negative']
      },
      maxYears: {
        type: Number,
        min: [0, 'Maximum years cannot be negative']
      },
      level: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'executive'],
        required: [true, 'Experience level is required']
      }
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
    location: {
      type: String,
      trim: true
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative']
      },
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for search optimization
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ requiredSkills: 1 });

export default mongoose.model<IJob>('Job', JobSchema);
