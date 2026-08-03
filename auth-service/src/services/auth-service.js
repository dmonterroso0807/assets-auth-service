import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/jwt-util.js";

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
      "Usuario inactivo, contacte al administrador",
      403,
      "USER_INACTIVE",
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

const toPublicUser = (user) => ({
  id: user._id,
  role: user.role,
  name: user.name,
  userName: user.userName,
  email: user.email,
  accountNumber: user.accountNumber,
  status: user.status,
});

export { ServiceError };
