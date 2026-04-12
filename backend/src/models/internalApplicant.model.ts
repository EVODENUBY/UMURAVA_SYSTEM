import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInternalApplicant extends Document {
  userId: Types.ObjectId;
  talentProfileId: Types.ObjectId;
  jobId?: Types.ObjectId;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  resumeText?: string;
  resumeFilePath?: string;
  resumeLink?: string;
  coverLetter?: string;
  appliedAt?: Date;
  source: 'portal';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InternalApplicantSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    talentProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'TalentProfile'
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'],
      default: 'applied'
    },
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
    coverLetter: {
      type: String,
      trim: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['portal'],
      default: 'portal'
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

InternalApplicantSchema.index({ jobId: 1, status: 1 });
InternalApplicantSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model<IInternalApplicant>('InternalApplicant', InternalApplicantSchema);