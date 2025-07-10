import { Router } from "express";
import { CryptocurrencyController } from "../controllers/cryptocurrencyController";

const router = Router();

router.get("/", CryptocurrencyController.getAllCryptocurrencies);
router.get("/:id", CryptocurrencyController.getCryptocurrencyById);

export default router;
