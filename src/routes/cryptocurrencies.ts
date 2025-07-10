import { Router } from "express";
import { CryptocurrencyController } from "@/controllers/cryptocurrencyController";
import { authenticateToken } from "@/middleware/auth";

const router = Router();

// Apply authentication to all cryptocurrency routes
router.use(authenticateToken);

router.get("/", CryptocurrencyController.getAllCryptocurrencies);
router.get("/:id", CryptocurrencyController.getCryptocurrencyById);

export default router;
