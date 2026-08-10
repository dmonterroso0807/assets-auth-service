import User from "../models/user-model.js";
import { ServiceError } from "../utils/service-error.js";
import { toPublicUser } from "../utils/user-mapper.js";

const PUBLIC_LIST_FIELDS =
  "role name userName dpi address phone email status -_id";

export const listUsers = async () => {
  const users = await User.find().select(PUBLIC_LIST_FIELDS).lean();
  return users;
};

const EDITABLE_FIELDS = ["name", "address", "jobName", "monthlyIncome"];

const findUserOr404 = async (userName) => {
  const user = await User.findOne({ userName });
  if (!user) {
    throw new ServiceError("Usuario no encontrado", 404, "USER_NOT_FOUND");
  }
  return user;
};

// Matriz de permisos:
// - SUPER_ADMIN: puede editar ADMIN, CLIENT y su propia cuenta (no la de otro SUPER_ADMIN).
// - ADMIN: puede editar su propia cuenta y cuentas CLIENT (no otros ADMIN ni SUPER_ADMIN).
// - CLIENT: solo puede editar su propia cuenta.
const canEditAccount = (actingUser, targetUser) => {
  const isSelf = actingUser.userName === targetUser.userName;
  if (isSelf) return true;

  if (actingUser.role === "SUPER_ADMIN") {
    return targetUser.role === "ADMIN" || targetUser.role === "CLIENT";
  }

  if (actingUser.role === "ADMIN") {
    return targetUser.role === "CLIENT";
  }

  return false; // CLIENT solo puede editarse a sí mismo
};

export const updateAccount = async (actingUser, targetUserName, payload) => {
  const targetUser = await findUserOr404(targetUserName);

  if (!canEditAccount(actingUser, targetUser)) {
    throw new ServiceError(
      "No tienes permisos para modificar esta cuenta",
      403,
      "FORBIDDEN",
    );
  }

  for (const field of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      targetUser[field] = payload[field];
    }
  }

  await targetUser.save();
  return toPublicUser(targetUser);
};

/* Solo el administrador general (SUPER_ADMIN) puede cambiar roles, y no puede
   cambiar su propio rol para evitar quedarse sin acceso administrativo. */
export const changeUserRole = async (actingUser, targetUserName, newRole) => {
  if (actingUser.role !== "SUPER_ADMIN") {
    throw new ServiceError(
      "Solo el administrador general puede cambiar roles",
      403,
      "FORBIDDEN",
    );
  }

  const targetUser = await findUserOr404(targetUserName);

  if (targetUser.userName === actingUser.userName) {
    throw new ServiceError(
      "No puedes cambiar tu propio rol",
      400,
      "CANNOT_CHANGE_OWN_ROLE",
    );
  }

  targetUser.role = newRole;
  await targetUser.save({ validateBeforeSave: false });
  return toPublicUser(targetUser);
};
