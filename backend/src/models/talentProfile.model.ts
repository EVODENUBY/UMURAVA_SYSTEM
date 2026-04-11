import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProfileCompletion {
  basicInfo: number;
  skills: number;
  languages: number;
  experience: number;
  education: number;
  certifications: number;
  projects: number;
  availability: number;
  socialLinks: number;
  overall: number;
}

export interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

export interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface IExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface ICertification {
  name: string;
  issuer: string;
  issueDate: string;
}

export interface IProject {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface IAvailability {
  status: 'Available' | 'Open to Opportunities' | 'Not Available';
  type: 'Full-time' | 'Part-time' | 'Contract';
  startDate: string;
}

export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface IBasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar?: string;
}

export interface ITalentProfile extends Document {
  userId: Types.ObjectId;
  basicInfo: IBasicInfo;
  skills: ISkill[];
  languages: ILanguage[];
  experience: IExperience[];
  education: IEducation[];
  certifications: ICertification[];
  projects: IProject[];
  availability?: IAvailability;
  socialLinks?: ISocialLinks;
  profileCompletion: IProfileCompletion;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true },
  yearsOfExperience: { type: Number, default: 0, min: 0 }
});

const LanguageSchema = new Schema({
  name: { type: String, required: true },
  proficiency: { type: String, enum: ['Basic', 'Conversational', 'Fluent', 'Native'], required: true }
});

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: 'Present' },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  isCurrent: { type: Boolean, default: false }
});

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, default: '' },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true }
});

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, required: true }
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  role: { type: String, default: '' },
  link: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' }
});

const AvailabilitySchema = new Schema({
  status: { type: String, enum: ['Available', 'Open to Opportunities', 'Not Available'], default: 'Open to Opportunities' },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
  startDate: { type: String, default: '' }
});

const SocialLinksSchema = new Schema({
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' }
});

const ProfileCompletionSchema = new Schema({
  basicInfo: { type: Number, default: 0, min: 0, max: 100 },
  skills: { type: Number, default: 0, min: 0, max: 100 },
  languages: { type: Number, default: 0, min: 0, max: 100 },
  experience: { type: Number, default: 0, min: 0, max: 100 },
  education: { type: Number, default: 0, min: 0, max: 100 },
  certifications: { type: Number, default: 0, min: 0, max: 100 },
  projects: { type: Number, default: 0, min: 0, max: 100 },
  availability: { type: Number, default: 0, min: 0, max: 100 },
  socialLinks: { type: Number, default: 0, min: 0, max: 100 },
  overall: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });

const TalentProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    basicInfo: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      headline: { type: String, default: '', maxlength: 200 },
      bio: { type: String, default: '', maxlength: 2000 },
      location: { type: String, default: '', maxlength: 200 },
      phone: { type: String, default: '' },
      avatar: { type: String, default: '' }
    },
    skills: {
      type: [SkillSchema],
      default: []
    },
    languages: {
      type: [LanguageSchema],
      default: []
    },
    experience: {
      type: [ExperienceSchema],
      default: []
    },
    education: {
      type: [EducationSchema],
      default: []
    },
    certifications: {
      type: [CertificationSchema],
      default: []
    },
    projects: {
      type: [ProjectSchema],
      default: []
    },
    availability: {
      type: AvailabilitySchema,
      default: { status: 'Open to Opportunities', type: 'Full-time', startDate: '' }
    },
    socialLinks: {
      type: SocialLinksSchema,
      default: { linkedin: '', github: '', portfolio: '' }
    },
    profileCompletion: {
      type: ProfileCompletionSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

TalentProfileSchema.index({ userId: 1 }, { unique: true });
TalentProfileSchema.index({ 'basicInfo.firstName': 'text', 'basicInfo.lastName': 'text', 'basicInfo.headline': 'text' });

export default mongoose.model<ITalentProfile>('TalentProfile', TalentProfileSchema);