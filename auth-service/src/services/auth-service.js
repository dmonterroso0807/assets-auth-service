import bycrypt from "bcrypt";
import User from "../models/user-model.js";
import {
  generateAccessToken,
  generateRefreshToken,
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
