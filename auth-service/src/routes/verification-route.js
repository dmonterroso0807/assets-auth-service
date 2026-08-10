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

/* POST en vez de GET: el uid y el token viajan en el body, no en la URL,
   para que no queden expuestos en el historial del navegador, logs de acceso,
   cachés intermedias ni en el header Referer. */
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
