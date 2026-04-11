import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExternalApplicant extends Document {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: {
    years: number;
    currentRole?: string;
    previousRoles?: Array<{
      title: string;
      company: string;
      duration: string;
    }>;
  };
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    field?: string;
  }>;
  resumeText: string;
  resumeFilePath?: string;
  resumeLink?: string;
  source: 'pdf' | 'csv' | 'excel' | 'link' | 'manual';
  jobId?: Types.ObjectId;
  status: 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ExternalApplicantSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    skills: {
      type: [String],
      default: []
    },
    skillDetails: [
      {
        name: { type: String, required: true },
        level: { type: String, default: 'Intermediate' },
        yearsOfExperience: { type: Number, default: 0 }
      }
    ],
    experience: {
      years: {
        type: Number,
        default: 0,
        min: [0, 'Years of experience cannot be negative']
      },
      currentRole: {
        type: String,
        trim: true
      },
      previousRoles: [
        {
          title: { type: String, required: true },
          company: { type: String, required: true },
          duration: { type: String, required: true }
        }
      ]
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        field: { type: String }
      }
    ],
    languages: [
      {
        name: { type: String, required: true },
        proficiency: { type: String, default: 'Fluent' }
      }
    ],
    resumeText: {
      type: String,
      trim: true
    },
    resumeFilePath: {
      type: String
    },
    resumeLink: {
      type: String
    },
    source: {
      type: String,
      enum: ['pdf', 'csv', 'excel', 'link', 'manual'],
      default: 'manual'
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    },
    status: {
      type: String,
      enum: ['screening', 'interview', 'offer', 'hired', 'rejected'],
      default: 'screening'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ExternalApplicantSchema.index({ name: 'text', resumeText: 'text' });
ExternalApplicantSchema.index({ skills: 1 });
ExternalApplicantSchema.index({ email: 1 });
ExternalApplicantSchema.index({ jobId: 1, status: 1 });

export default mongoose.model<IExternalApplicant>('ExternalApplicant', ExternalApplicantSchema);