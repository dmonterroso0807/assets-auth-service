import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  registerClientController,
  verifyEmailController,
  resendVerificationController,
  updateAccountController,
  changeRoleController,
  listUsersController,
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
  verifyEmailSchema,
  updateAccountSchema,
  changeRoleSchema,
} from "../schemas/auth-schema.js";

const router = Router();

// Login
router.post(
  "/login",
  loginRateLimitConfig,
  validateBody(loginSchema),
  loginController,
);

// Refrescar Token
router.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  refreshTokenController,
);

/* POST en vez de GET: el uid y el token viajan en el body, no en la URL,
   para que no queden expuestos en el historial del navegador, logs de acceso,
   cachés intermedias ni en el header Referer. */
router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  verifyEmailController,
);

// Enviar correo de verificación nuevamente
router.post(
  "/resend-verification",
  rateLimitConfig,
  validateBody(resendVerificationSchema),
  resendVerificationController,
);

// Solo ADMIN o SUPER_ADMIN: crear clientes
router.post(
  "/register",
  verifyAccessToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(registerClientSchema),
  registerClientController,
);

/**
 * * LISTADO DE USUARIOS
 * ! Permisos: Solo ADMIN o SUPER_ADMIN.
 *
 * * Razón de seguridad:
 * * Aunque la respuesta viene sanitizada (sin _id, password, tokens, dpi, etc.),
 * ! la lista de usuarios (nombres, correos, usernames) es información interna
 * ! y no debe quedar expuesta sin autenticación previa.
 */
router.get(
  "/users",
  verifyAccessToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  listUsersController,
);

// Actualizar
router.patch(
  "/users/:id",
  verifyAccessToken,
  validateBody(updateAccountSchema),
  updateAccountController,
);

// Cambio de rol: exclusivo del administrador general (SUPER_ADMIN)
router.patch(
  "/users/:id/role",
  verifyAccessToken,
  authorizeRoles("SUPER_ADMIN"),
  validateBody(changeRoleSchema),
  changeRoleController,
);

export default router;
