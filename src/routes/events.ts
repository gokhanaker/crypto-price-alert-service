import { Router } from 'express';
import { EventController } from '@/controllers/eventController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

router.use(authenticateToken);

EventController.getInstance();

export default router;
