import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt-util.js";
import { sendVerificationEmail } from "../utils/mailer.js";
import { ServiceError } from "../utils/service-error.js";
import { toPublicUser } from "../utils/user-mapper.js";
import {
  generateRawToken,
  hashToken,
  minutesFromNow,
  buildTokenUrl,
} from "../utils/token-util.js";

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRES_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_EXPIRES_MIN || 60,
);

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

  const passwordMatches = await bycrypt.compare(password, user.password);
  if (!passwordMatches) {
    console.warn(
      `[ALERTA DE SEGURIDAD] Login fallido para userName: ${userName}`,
    );
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
      { userName: payload.userName },
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
  const rawToken = generateRawToken(VERIFICATION_TOKEN_BYTES);
  const emailVerificationExpires = minutesFromNow(VERIFICATION_EXPIRES_MINUTES);

  let client;
  try {
    client = await User.create({
      ...payload,
      role: "CLIENT",
      password: hashedPassword,
      status: false,
      emailVerificationTokenHash: hashToken(rawToken),
      emailVerificationExpires,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ServiceError(
        "Ya existe un usuario con ese username, correo o DPI",
        409,
        "USER_ALREADY_EXISTS",
      );
    }
    throw error;
  }

  await sendVerificationEmail({
    to: client.email,
    name: client.name,
    verificationUrl: buildTokenUrl(
      process.env.EMAIL_VERIFICATION_BASE_URL,
      client._id.toString(),
      rawToken,
    ),
  });

  return toPublicUser(client);
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

  const newRefreshToken = generateRefreshToken(user);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user);
  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken) => {
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    return;
  }

  const user = await User.findById(payload.uid).select("+refreshTokens");
  if (!user) return;

  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  await user.save({ validateBeforeSave: false });
};
