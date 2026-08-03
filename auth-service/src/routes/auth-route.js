import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  registerClientController,
  verifyEmailController,
  resendVerificationController,
} from "../controllers/auth-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import {
  verifyAccessToken,
  authorizeRoles,
} from "../middlewares/auth-middleware.js";
import {
  loginRateLimitConfig,
  rateLimitConfig,
} from "../middlewares/rateLimit-configuration.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerClientSchema,
  resendVerificationSchema,
} from "../schemas/auth-schema.js";

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
router.get("/verify-email", verifyEmailController);
router.post(
  "/resend-verification",
  rateLimitConfig,
  validateBody(resendVerificationSchema),
  resendVerificationController,
);

// Solo ADMIN: crear clientes
router.post(
  "/register",
  verifyAccessToken,
  authorizeRoles("ADMIN"),
  validateBody(registerClientSchema),
  registerClientController,
);

export default router;
