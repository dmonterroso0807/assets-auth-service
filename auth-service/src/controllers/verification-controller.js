import * as verificationService from "../services/verification-service.js";
import { ok } from "../utils/apiResponse.util.js";
import { handleServiceError } from "../utils/handle-service-error.js";

export const verifyEmailController = async (req, res) => {
  try {
    const { uid, token } = req.body;
    const result = await verificationService.verifyEmail({ uid, token });

    if (result.alreadyVerified) {
      return ok(res, {
        message: "El correo ya había sido verificado",
        data: result.user,
      });
    }

    return ok(res, {
      message: "Correo verificado exitosamente, tu cuenta ya está activa",
      data: result.user,
    });
  } catch (error) {
    return handleServiceError(res, error, "Verification");
  }
};

export const resendVerificationController = async (req, res) => {
  try {
    const result = await verificationService.resendVerificationEmail(
      req.body.email,
    );
    return ok(res, { message: result.message });
  } catch (error) {
    return handleServiceError(res, error, "Verification");
  }
};
