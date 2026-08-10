import { Router } from "express";
import {
  verifyEmailController,
  resendVerificationController,
} from "../controllers/verification-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import {
  emailSendingRateLimitConfig,
  tokenRateLimitConfig,
} from "../middlewares/rateLimit-configuration.js";
import {
  verifyEmailSchema,
  resendVerificationSchema,
} from "../schemas/verification-schema.js";

const router = Router();

router.post(
  "/verify-email",
  tokenRateLimitConfig,
  validateBody(verifyEmailSchema),
  verifyEmailController,
);

router.post(
  "/resend-verification",
  emailSendingRateLimitConfig,
  validateBody(resendVerificationSchema),
  resendVerificationController,
);

export default router;
