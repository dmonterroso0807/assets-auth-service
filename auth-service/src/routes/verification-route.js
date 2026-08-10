import { Router } from "express";
import {
  verifyEmailController,
  resendVerificationController,
} from "../controllers/verification-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import {
  verifyEmailSchema,
  resendVerificationSchema,
} from "../schemas/verification-schema.js";

const router = Router();

router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  verifyEmailController,
);

router.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  resendVerificationController,
);

export default router;
