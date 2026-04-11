import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.middleware';
import User, { UserRole } from '../models/user.model';

const router = Router();

/**
 * @swagger
 * /api/admin/create-user:
 *   post:
 *     summary: Create recruiter or admin user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [recruiter, admin]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/create-user', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Email, password, and role are required' } 
      });
    }

    if (role !== 'recruiter' && role !== 'admin') {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Role must be recruiter or admin' } 
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: { message: 'Email already exists' } 
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role as UserRole,
      phone
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error creating user' } });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get('/users', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    
    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Deactivate a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deactivated
 *       401:
 *         description: Unauthorized
 */
router.delete('/users/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user?.id;

    if (id === currentUserId) {
      return res.status(400).json({ success: false, error: { message: 'Cannot deactivate yourself' } });
    }

    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/admin/users/deactivate:
 *   post:
 *     summary: Deactivate a user by ID in request body (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User deactivated
 *       400:
 *         description: Cannot deactivate yourself
 *       404:
 *         description: User not found
 */
router.post('/users/deactivate', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const currentUserId = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: { message: 'userId is required' } });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ success: false, error: { message: 'Cannot deactivate yourself' } });
    }

    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.json({ success: true, message: 'User deactivated', data: { userId, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

/**
 * @swagger
 * /api/admin/users/reactivate:
 *   post:
 *     summary: Reactivate a deactivated user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User reactivated
 *       404:
 *         description: User not found
 */
router.post('/users/reactivate', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: { message: 'userId is required' } });
    }

    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    res.json({ success: true, message: 'User reactivated', data: { userId, email: user.email, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
});

export default router;