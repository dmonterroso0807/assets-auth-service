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
