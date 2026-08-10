import { ServiceError } from "./service-error.js";
import { fail } from "./apiResponse.util.js";

export const handleServiceError = (res, error, context = "Service") => {
  if (error instanceof ServiceError) {
    return fail(res, {
      message: error.message,
      status: error.status,
      error: error.code,
    });
  }

  console.error(`${context} error:`, error);
  return fail(res, {
    message: "Error interno del servidor",
    status: 500,
    error: "INTERNAL_ERROR",
  });
};
