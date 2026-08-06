import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/user-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt-util.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRES_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_EXPIRES_MIN || 60,
);

const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

class ServiceError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    (super(message), (this.status = status), (this.code = code));
  }
}

export const login = async ({ userName, password }) => {
  const user = await User.findOne({
    $or: [{ userName }, { email: userName.toLowerCase() }],
  }).select("+password +refreshTokens");

  if (!user) {
    throw new ServiceError(
      "Usuario o contraseña incorrectos",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  if (!user.status) {
    throw new ServiceError(
      "Debes verificar tu correo electrónico antes de iniciar sesión",
      403,
      "EMAIL_NOT_VERIFIED",
    );
  }

  const passwordMatches = await bycrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new ServiceError(
      "Usuario o contraseña incorrectos",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
};

export const registerClient = async (payload) => {
  const existing = await User.findOne({
    $or: [
      { username: payload.userName },
      { email: payload.email },
      { dpi: payload.dpi },
    ],
  });

  if (existing) {
    throw new ServiceError(
      "Ya existe un usuario con ese username, correo o DPI",
      409,
      "USER_ALREADY_EXISTS",
    );
  }

  const hashedPassword = await bycrypt.hash(payload.password, SALT_ROUNDS);

  const rawToken = crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  const emailVerificationExpires = new Date(
    Date.now() + VERIFICATION_EXPIRES_MINUTES * 60 * 1000,
  );

  const client = await User.create({
    ...payload,
    role: "CLIENT",
    password: hashedPassword,
    status: false,
    emailVerificationTokenHash: hashToken(rawToken),
    emailVerificationExpires,
  });

  await sendVerificationEmail({
    to: client.email,
    name: client.name,
    verificationUrl: buildVerificationUrl(client._id.toString(), rawToken),
  });

  return toPublicUser(client);
};

export const verifyEmail = async ({ uid, token }) => {
  if (!uid || !token) {
    throw new ServiceError(
      "El enlace de verificación es inválido",
      400,
      "INVALID_VERIFICATION_LINK",
    );
  }

  let user;
  try {
    user = await User.findById(uid).select(
      "+emailVerificationTokenHash +emailVerificationExpires",
    );
  } catch (error) {
    // uid con formato inválido (CastError de Mongoose)
    throw new ServiceError(
      "El enlace de verificación es inválido",
      400,
      "INVALID_VERIFICATION_LINK",
      error,
    );
  }

  if (!user) {
    throw new ServiceError(
      "El enlace de verificación es inválido",
      400,
      "INVALID_VERIFICATION_LINK",
    );
  }

  if (user.status) {
    return { alreadyVerified: true, user: toPublicUser(user) };
  }

  if (
    !user.emailVerificationTokenHash ||
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    throw new ServiceError(
      "El enlace de verificación expiró, solicita uno nuevo",
      400,
      "VERIFICATION_TOKEN_EXPIRED",
    );
  }

  const tokenMatches = user.emailVerificationTokenHash === hashToken(token);
  if (!tokenMatches) {
    throw new ServiceError(
      "El enlace de verificación es inválido",
      400,
      "INVALID_VERIFICATION_LINK",
    );
  }

  user.status = true;
  user.emailVerificationTokenHash = null;
  user.emailVerificationExpires = null;
  await user.save({ validateBeforeSave: false });

  return { alreadyVerified: false, user: toPublicUser(user) };
};

export const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+emailVerificationTokenHash +emailVerificationExpires",
  );

  // Respuesta genérica: no revelamos si el correo existe o no (evita user enumeration)
  const genericResponse = {
    message:
      "Si el correo existe y no ha sido verificado, se ha enviado un nuevo enlace",
  };

  if (!user || user.status) {
    return genericResponse;
  }

  const rawToken = crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");
  user.emailVerificationTokenHash = hashToken(rawToken);
  user.emailVerificationExpires = new Date(
    Date.now() + VERIFICATION_EXPIRES_MINUTES * 60 * 1000,
  );
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl: buildVerificationUrl(user._id.toString(), rawToken),
  });

  return genericResponse;
};

const buildVerificationUrl = (uid, rawToken) => {
  const base =
    process.env.EMAIL_VERIFICATION_BASE_URL ||
    "http://localhost:5173/verify-email";
  return `${base}?uid=${uid}&token=${rawToken}`;
};

export const refreshAccessToken = async (refreshToken) => {
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ServiceError(
        "El refresh token ha expirado",
        401,
        "REFRESH_TOKEN_EXPIRED",
      );
    }
    throw new ServiceError(
      "Refresh token inválido",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  if (payload.type !== "refresh") {
    throw new ServiceError(
      "Token inválido para esta operación",
      401,
      "INVALID_TOKEN_TYPE",
    );
  }

  const user = await User.findById(payload.uid).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new ServiceError(
      "Refresh token inválido o revocado",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
};

const PUBLIC_LIST_FIELDS =
  "role name userName dpi address phone email status -_id";

export const listUsers = async () => {
  const users = await User.find().select(PUBLIC_LIST_FIELDS).lean();
  return users;
};

const EDITABLE_FIELDS = ["name", "address", "jobName", "monthlyIncome"];

const findUserOr404 = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new ServiceError("Usuario no encontrado", 404, "USER_NOT_FOUND");
  }
  const user = await User.findById(userId);
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
  const isSelf = actingUser.uid === targetUser._id.toString();
  if (isSelf) return true;

  if (actingUser.role === "SUPER_ADMIN") {
    return targetUser.role === "ADMIN" || targetUser.role === "CLIENT";
  }

  if (actingUser.role === "ADMIN") {
    return targetUser.role === "CLIENT";
  }

  return false; // CLIENT solo puede editarse a sí mismo
};

export const updateAccount = async (actingUser, targetUserId, payload) => {
  const targetUser = await findUserOr404(targetUserId);

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
export const changeUserRole = async (actingUser, targetUserId, newRole) => {
  if (actingUser.role !== "SUPER_ADMIN") {
    throw new ServiceError(
      "Solo el administrador general puede cambiar roles",
      403,
      "FORBIDDEN",
    );
  }

  const targetUser = await findUserOr404(targetUserId);

  if (targetUser._id.toString() === actingUser.uid) {
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

const toPublicUser = (user) => ({
  id: user._id,
  role: user.role,
  name: user.name,
  userName: user.userName,
  email: user.email,
  status: user.status,
});

export { ServiceError };
