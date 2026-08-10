import { Router } from "express";
import {
  listUsersController,
  updateAccountController,
  changeRoleController,
} from "../controllers/user-controller.js";
import { validateBody } from "../middlewares/validate-middleware.js";
import {
  verifyAccessToken,
  authorizeRoles,
} from "../middlewares/auth-middleware.js";
import {
  updateAccountSchema,
  changeRoleSchema,
} from "../schemas/user-schema.js";

const router = Router();

/**
 * * LISTADO DE USUARIOS
 * ! Permisos: Solo ADMIN o SUPER_ADMIN.
 *
 * * Razón de seguridad:
 * * La respuesta viene sanitizada: solo role, name, userName, dpi, address,
 * ! phone, email y status. Nunca se expone el _id de Mongo ni datos
 * ! sensibles (password, tokens). Aun así, esta lista es información
 * ! interna y no debe quedar expuesta sin autenticación previa.
 */
router.get(
  "/users",
  verifyAccessToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  listUsersController,
);

router.patch(
  "/users/:userName",
  verifyAccessToken,
  validateBody(updateAccountSchema),
  updateAccountController,
);

router.patch(
  "/users/:userName/role",
  verifyAccessToken,
  authorizeRoles("SUPER_ADMIN"),
  validateBody(changeRoleSchema),
  changeRoleController,
);

export default router;
