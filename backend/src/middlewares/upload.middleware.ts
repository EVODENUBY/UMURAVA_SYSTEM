import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createError } from './error.middleware';

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const resumesDir = path.join(uploadsDir, 'resumes');
const csvDir = path.join(uploadsDir, 'csv');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

// Configure disk storage for resumes
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumesDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

// Configure disk storage for CSV
const csvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, csvDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'applicants-' + uniqueSuffix + ext);
  }
});

// File filter for PDF and CSV
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  const allowedMimetypes = [
    'application/pdf',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const allowedExtensions = ['.pdf', '.csv', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimetypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    callback(null, true);
  } else {
    callback(createError(
      `File type not supported. Allowed types: PDF, CSV, XLS, XLSX`,
      400
    ) as Error);
  }
};

// Get max file size from env or default to 10MB
const getMaxFileSize = (): number => {
  const envSize = process.env.MAX_FILE_SIZE;
  return envSize ? parseInt(envSize, 10) : 10 * 1024 * 1024; // 10MB default
};

// Single file upload middleware for resumes
export const uploadSingle = multer({
  storage: resumeStorage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
    files: 1
  }
}).single('resume');

// Single file upload with any field name (for general file uploads)
export const uploadAny = multer({
  storage: csvStorage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
    files: 1
  }
}).any();

// Multiple files upload middleware
export const uploadMultiple = multer({
  storage: resumeStorage,
  fileFilter,
  limits: {
    fileSize: getMaxFileSize(),
    files: 10 // Max 10 files at once
  }
}).array('resumes', 10);

// CSV upload middleware
export const uploadCSV = multer({
  storage: csvStorage,
  fileFilter: (_req, file, callback) => {
    const allowedMimetypes = ['text/csv', 'application/csv'];
    const allowedExtensions = ['.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimetypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      callback(null, true);
    } else {
      callback(createError(
        'Only CSV files are allowed for bulk upload',
        400
      ) as Error);
    }
  },
  limits: {
    fileSize: getMaxFileSize(),
    files: 1
  }
}).single('csv');

// Error handler for multer
export const handleUploadError = (
  err: Error,
  _req: Request,
  _res: Response,
  next: Function
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(createError(
        `File too large. Maximum size is ${getMaxFileSize() / 1024 / 1024}MB`,
        400
      ));
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      next(createError('Too many files uploaded', 400));
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      next(createError('Unexpected field name for file upload', 400));
    } else {
      next(createError(`Upload error: ${err.message}`, 400));
    }
  } else {
    next(err);
  }
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadCSV,
  uploadExcel: uploadCSV, 
  uploadAny,
  handleUploadError
};
