import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  registerClientController,
} from "../controllers/auth-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import {
  verifyAccessToken,
  authorizeRoles,
} from "../middlewares/auth-middleware.js";
import { loginRateLimitConfig } from "../middlewares/rateLimit-configuration.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerClientSchema,
} from "../schemas/auth-schema.js";

const router = Router();

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

// Solo ADMIN o SUPER_ADMIN: crear clientes
router.post(
  "/register",
  verifyAccessToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(registerClientSchema),
  registerClientController,
);

export default router;
