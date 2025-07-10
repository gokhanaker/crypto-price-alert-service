import { Router } from 'express';
import { HealthController } from '@/controllers/healthController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Apply authentication to all health routes
router.use(authenticateToken);

router.get('/', HealthController.getHealthStatus);
router.get('/scheduler', HealthController.getSchedulerHealth);

export default router;
