import * as authService from "../services/auth-service.js";
import { ok } from "../utils/apiResponse.util.js";
import { handleServiceError } from "../utils/handle-service-error.js";

export const loginController = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return ok(res, { message: "Inicio de sesión exitoso", data: result });
  } catch (error) {
    return handleServiceError(res, error, "Auth");
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return ok(res, { message: "Token renovado", data: result });
  } catch (error) {
    return handleServiceError(res, error, "Auth");
  }
};

export const logoutController = async (req, res) => {
  try {
    await authService.logout(req.body.refreshToken);
    return ok(res, { message: "Sesión cerrada exitosamente" });
  } catch (error) {
    return handleServiceError(res, error, "Auth");
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
    return handleServiceError(res, error, "Auth");
  }
};
