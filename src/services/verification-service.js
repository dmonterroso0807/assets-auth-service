import mongoose from "mongoose";
import User from "../models/user-model.js";
import { sendVerificationEmail } from "../utils/mailer.js";
import { ServiceError } from "../utils/service-error.js";
import { toPublicUser } from "../utils/user-mapper.js";
import {
  generateRawToken,
  hashToken,
  safeCompareHex,
  minutesFromNow,
  buildTokenUrl,
} from "../utils/token-util.js";

const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRES_MINUTES = Number(
  process.env.EMAIL_VERIFICATION_EXPIRES_MIN || 60,
);

export const verifyEmail = async ({ uid, token }) => {
  if (!uid || !token || !mongoose.isValidObjectId(uid)) {
    throw new ServiceError(
      "El enlace de verificación es inválido",
      400,
      "INVALID_VERIFICATION_LINK",
    );
  }

  const user = await User.findById(uid).select(
    "+emailVerificationTokenHash +emailVerificationExpires",
  );

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

  const tokenMatches = safeCompareHex(
    user.emailVerificationTokenHash,
    hashToken(token),
  );
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

  const genericResponse = {
    message:
      "Si el correo existe y no ha sido verificado, se ha enviado un nuevo enlace",
  };

  if (!user || user.status) {
    return genericResponse;
  }

  const rawToken = generateRawToken(VERIFICATION_TOKEN_BYTES);
  user.emailVerificationTokenHash = hashToken(rawToken);
  user.emailVerificationExpires = minutesFromNow(VERIFICATION_EXPIRES_MINUTES);
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl: buildTokenUrl(
      process.env.EMAIL_VERIFICATION_BASE_URL,
      user._id.toString(),
      rawToken,
    ),
  });

  return genericResponse;
};
