import { Router } from "express";
import {
  loginController,
  refreshTokenController,
} from "../controllers/auth-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import { loginRateLimitConfig } from "../middlewares/rateLimit-configuration.js";
import { loginSchema, refreshTokenSchema } from "../schemas/auth-schema.js";

const router = Router();

// Público
router.post(
  "/login",
  loginRateLimitConfig,
  validateBody(loginSchema),
  loginController,
);
router.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  refreshTokenController,
);

export default router;
