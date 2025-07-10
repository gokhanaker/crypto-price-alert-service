import { Request, Response } from "express";
import { AuthService } from "@/services/authService";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        message: "User registered successfully",
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        message: "Login successful",
        ...result,
      });
    } catch (error: any) {
      res.status(401).json({
        error: error.message,
      });
    }
  }
}
