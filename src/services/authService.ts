import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import prisma from "../config/database";
import { User, CreateUserRequest, LoginRequest, AuthResponse } from "../types";

export class AuthService {
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = userData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: "24h" }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  static async verifyToken(token: string): Promise<Omit<User, "passwordHash">> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        userId: string;
        email: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
