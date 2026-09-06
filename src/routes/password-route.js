import { Router } from "express";
import {
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/password-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import {
  emailSendingRateLimitConfig,
  tokenRateLimitConfig,
} from "../middlewares/rateLimit-configuration.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/password-schema.js";

const router = Router();

router.post(
  "/forgot-password",
  emailSendingRateLimitConfig,
  validateBody(forgotPasswordSchema),
  forgotPasswordController,
);

router.post(
  "/reset-password",
  tokenRateLimitConfig,
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

export default router;
