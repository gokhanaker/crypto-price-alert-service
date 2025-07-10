import { Router } from 'express';
import { EventController } from '@/controllers/eventController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Apply authentication to all event routes
router.use(authenticateToken);

// Initialize event controller
EventController.getInstance();

export default router;
