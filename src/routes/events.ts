import { Router } from 'express';
import { EventController } from '@/controllers/eventController';

const router = Router();

// Initialize event controller
EventController.getInstance();

export default router; 