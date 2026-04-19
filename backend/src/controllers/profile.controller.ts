import { Request, Response } from 'express';
import TalentProfile from '../models/talentProfile.model';
import InternalApplicant from '../models/internalApplicant.model';

const calculateProfileCompletion = (profile: any) => {
  const sections = {
    basicInfo: 0,
    skills: 0,
    languages: 0,
    experience: 0,
    education: 0,
    certifications: 0,
    projects: 0,
    availability: 0,
    socialLinks: 0
  };

  const { basicInfo, skills, languages, experience, education, certifications, projects, availability, socialLinks } = profile;
  
  console.log('[DEBUG] calculateProfileCompletion - basicInfo:', {
    firstName: basicInfo?.firstName,
    lastName: basicInfo?.lastName,
    avatar: basicInfo?.avatar ? 'present (length: ' + basicInfo.avatar.length + ')' : 'empty',
    photo: basicInfo?.photo ? 'present (length: ' + basicInfo.photo.length + ')' : 'empty'
  });

  if (basicInfo.firstName && basicInfo.lastName && basicInfo.email) {
    sections.basicInfo = 100;
  }

  if (skills && skills.length > 0) {
    sections.skills = Math.min(100, skills.length * 20);
  }

  if (languages && languages.length > 0) {
    sections.languages = Math.min(100, languages.length * 25);
  }

  if (experience && experience.length > 0) {
    sections.experience = Math.min(100, experience.length * 25);
  }

  if (education && education.length > 0) {
    sections.education = Math.min(100, education.length * 50);
  }

  if (certifications && certifications.length > 0) {
    sections.certifications = Math.min(100, certifications.length * 50);
  }

  if (projects && projects.length > 0) {
    sections.projects = Math.min(100, projects.length * 33);
  }

  if (availability && availability.status) {
    sections.availability = 100;
  }

  if (socialLinks && (socialLinks.linkedin || socialLinks.github || socialLinks.portfolio)) {
    sections.socialLinks = 100;
  }

  const weights = {
    basicInfo: 0.20,
    skills: 0.15,
    languages: 0.05,
    experience: 0.20,
    education: 0.15,
    certifications: 0.05,
    projects: 0.10,
    availability: 0.05,
    socialLinks: 0.05
  };

  const overall = Object.keys(sections).reduce((total, key) => {
    return total + (sections as any)[key] * (weights as any)[key];
  }, 0);

  return { ...sections, overall: Math.round(overall) };
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const existingProfile = await TalentProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        error: { message: 'Profile already exists. Use update endpoint.' }
      });
    }

    const createData = { ...req.body };
    if (createData.basicInfo?.photo) {
      createData.basicInfo = { ...createData.basicInfo, avatar: createData.basicInfo.photo };
      delete createData.basicInfo.photo;
    }

    const profile = await TalentProfile.create({
      userId,
      ...createData,
      profileCompletion: calculateProfileCompletion(req.body)
    });

    console.log('[DEBUG] Create - stored avatar:', profile?.basicInfo?.avatar ? 'length: ' + profile.basicInfo.avatar.length : 'empty');

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error creating profile' } });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
    }

    console.log('[DEBUG] Get - stored avatar:', profile?.basicInfo?.avatar ? 'length: ' + profile.basicInfo.avatar.length : 'empty');
    console.log('[DEBUG] Get - stored photo:', (profile as any)?.basicInfo?.photo ? 'length: ' + (profile as any).basicInfo.photo.length : 'empty');

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error fetching profile' } });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
    }

    const updateData = { ...req.body };
    if (updateData.basicInfo?.photo) {
      updateData.basicInfo = { ...updateData.basicInfo, avatar: updateData.basicInfo.photo };
      delete updateData.basicInfo.photo;
    }

    const updatedProfile = await TalentProfile.findOneAndUpdate(
      { userId },
      {
        ...updateData,
        profileCompletion: calculateProfileCompletion({ ...profile.toObject(), ...req.body })
      },
      { new: true, runValidators: true }
    );

    console.log('[DEBUG] Update - incoming photo:', req.body?.basicInfo?.photo ? 'length: ' + req.body.basicInfo.photo.length : 'empty');
    console.log('[DEBUG] Update - stored avatar:', updatedProfile?.basicInfo?.avatar ? 'length: ' + updatedProfile.basicInfo.avatar.length : 'empty');
    
    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error updating profile' } });
  }
};

export const getProfileCompletion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await TalentProfile.findOne({ userId }).select('profileCompletion');
    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
    }

    res.json({ success: true, data: profile.profileCompletion });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const applyToJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const profile = await TalentProfile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please create a profile first before applying to jobs' }
      });
    }

    const existingApplication = await InternalApplicant.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: { message: 'You have already applied to this job' }
      });
    }

    const application = await InternalApplicant.create({
      userId,
      talentProfileId: profile._id,
      jobId,
      status: 'applied',
      appliedAt: new Date()
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error applying to job' } });
  }
};

export default { createProfile, getProfile, updateProfile, getProfileCompletion, applyToJob };