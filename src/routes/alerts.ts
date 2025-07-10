import { Router } from "express";
import { AlertController } from "@/controllers/alertController";
import {
  validateRequest,
  createAlertSchema,
  updateAlertSchema,
} from "@/middleware/validation";
import { authenticateToken } from "@/middleware/auth";

const router = Router();

router.use(authenticateToken);

router.post(
  "/",
  validateRequest(createAlertSchema),
  AlertController.createAlert
);
router.get("/", AlertController.getUserAlerts);
router.get("/triggered", AlertController.getTriggeredAlerts);
router.get("/:id", AlertController.getAlertById);
router.put(
  "/:id",
  validateRequest(updateAlertSchema),
  AlertController.updateAlert
);
router.delete("/:id", AlertController.deleteAlert);

export default router;
