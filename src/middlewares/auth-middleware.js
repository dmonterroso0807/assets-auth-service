import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt-util.js";
import { fail } from "../utils/apiResponse.util.js";

export const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return fail(res, {
      message: "Token no proporcionado",
      status: 401,
      error: "MISSING_TOKEN",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);

    if (payload.type === "refresh") {
      return fail(res, {
        message: "Token inválido para esta operación",
        status: 401,
        error: "INVALID_TOKEN_TYPE",
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return fail(res, {
        message: "El token ha expirado",
        status: 401,
        error: "TOKEN_EXPIRED",
      });
    }
    return fail(res, {
      message: "Token inválido",
      status: 401,
      error: "INVALID_TOKEN",
    });
  }
};

export const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return fail(res, {
        message: "No tienes permisos para realizar esta acción",
        status: 403,
        error: "FORBIDDEN",
      });
    }
    next();
  };
