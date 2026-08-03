import * as authService from "../services/auth-service.js";
import { ServiceError } from "../services/auth-service.js";
import { ok, fail } from "../utils/apiResponse.util.js";

const handleServiceError = (res, error) => {
  if (error instanceof ServiceError) {
    return fail(res, {
      message: error.message,
      status: error.status,
      error: error.code,
    });
  }
  console.error("Auth error:", error);
  return fail(res, {
    message: "Error interno del servidor",
    status: 500,
    error: "INTERNAL_ERROR",
  });
};

export const loginController = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return ok(res, { message: "Inicio de sesión exitoso", data: result });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return ok(res, { message: "Token renovado", data: result });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

export const registerClientController = async (req, res) => {
  try {
    const client = await authService.registerClient(req.body);
    return ok(res, {
      message:
        "Cliente creado exitosamente. Se envió un correo de verificación",
      status: 201,
      data: client,
    });
  } catch (error) {
    return handleServiceError(res, error);
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { uid, token } = req.query;
    const result = await authService.verifyEmail({ uid, token });

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
    return handleServiceError(res, error);
  }
};

export const resendVerificationController = async (req, res) => {
  try {
    const result = await authService.resendVerificationEmail(req.body.email);
    return ok(res, { message: result.message });
  } catch (error) {
    return handleServiceError(res, error);
  }
};
