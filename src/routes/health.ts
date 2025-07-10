import { Router } from "express";
import { HealthController } from "../controllers/healthController";

const router = Router();

router.get("/", HealthController.getHealthStatus);
router.get("/scheduler", HealthController.getSchedulerHealth);

export default router;
