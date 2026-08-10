import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/user-model.js";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../utils/mailer.js";
import { ServiceError } from "../utils/service-error.js";
import {
  generateRawToken,
  hashToken,
  safeCompareHex,
  minutesFromNow,
  buildTokenUrl,
} from "../utils/token-util.js";

const SALT_ROUNDS = 12;
const RESET_TOKEN_BYTES = 32;
const RESET_EXPIRES_MINUTES = Number(
  process.env.PASSWORD_RESET_EXPIRES_MIN || 30,
);

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  const genericResponse = {
    message:
      "Si el correo existe en nuestro sistema, se envió un enlace para restablecer la contraseña",
  };

  if (!user) {
    return genericResponse;
  }

  const rawToken = generateRawToken(RESET_TOKEN_BYTES);
  user.passwordResetTokenHash = hashToken(rawToken);
  user.passwordResetExpires = minutesFromNow(RESET_EXPIRES_MINUTES);
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: buildTokenUrl(
      process.env.PASSWORD_RESET_BASE_URL,
      user._id.toString(),
      rawToken,
    ),
  });

  return genericResponse;
};

export const resetPassword = async ({ uid, token, newPassword }) => {
  if (!uid || !token || !mongoose.isValidObjectId(uid)) {
    throw new ServiceError(
      "El enlace de restablecimiento es inválido",
      400,
      "INVALID_RESET_LINK",
    );
  }

  const user = await User.findById(uid).select(
    "+password +passwordResetTokenHash +passwordResetExpires +refreshTokens",
  );

  if (!user) {
    throw new ServiceError(
      "El enlace de restablecimiento es inválido",
      400,
      "INVALID_RESET_LINK",
    );
  }

  if (
    !user.passwordResetTokenHash ||
    !user.passwordResetExpires ||
    user.passwordResetExpires.getTime() < Date.now()
  ) {
    throw new ServiceError(
      "El enlace de restablecimiento expiró, solicita uno nuevo",
      400,
      "RESET_TOKEN_EXPIRED",
    );
  }

  const tokenMatches = safeCompareHex(
    user.passwordResetTokenHash,
    hashToken(token),
  );
  if (!tokenMatches) {
    throw new ServiceError(
      "El enlace de restablecimiento es inválido",
      400,
      "INVALID_RESET_LINK",
    );
  }

  const sameAsCurrentPassword = await bcrypt.compare(
    newPassword,
    user.password,
  );
  if (sameAsCurrentPassword) {
    throw new ServiceError(
      "La nueva contraseña debe ser diferente a la actual",
      400,
      "SAME_PASSWORD",
    );
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  await sendPasswordChangedEmail({ to: user.email, name: user.name });

  return {
    message: "Contraseña actualizada exitosamente. Inicia sesión de nuevo.",
  };
};
