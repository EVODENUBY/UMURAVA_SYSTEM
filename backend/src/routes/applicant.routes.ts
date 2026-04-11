import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import uploadMiddleware from '../middlewares/upload.middleware';

const router = Router();

router.get('/', protect, (req: any, res: any, next: any) => {
  res.status(200).json({ success: true, message: 'Use /api/applicants/internal or /api/applicants/external for applicant management' });
});

export default router;