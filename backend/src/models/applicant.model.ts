import mongoose, { Document, Schema } from 'mongoose';

export interface IApplicant extends Document {
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
  source: 'pdf' | 'csv' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema: Schema = new Schema(
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
    resumeText: {
      type: String,
      required: [true, 'Resume text is required'],
      trim: true
    },
    resumeFilePath: {
      type: String
    },
    source: {
      type: String,
      enum: ['pdf', 'csv', 'manual'],
      default: 'manual'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for search optimization
ApplicantSchema.index({ name: 'text', resumeText: 'text' });
ApplicantSchema.index({ skills: 1 });
ApplicantSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<IApplicant>('Applicant', ApplicantSchema);
