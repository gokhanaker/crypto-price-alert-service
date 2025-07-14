import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validateRequest, userRegistrationSchema, userLoginSchema } from '@/middleware/validation';

const router = Router();

router.post('/register', validateRequest(userRegistrationSchema), AuthController.register);
router.post('/login', validateRequest(userLoginSchema), AuthController.login);

export default router;
