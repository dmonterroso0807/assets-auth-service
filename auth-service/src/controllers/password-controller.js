import * as passwordService from "../services/password-service.js";
import { ok } from "../utils/apiResponse.util.js";
import { handleServiceError } from "../utils/handle-service-error.js";

export const forgotPasswordController = async (req, res) => {
  try {
    const result = await passwordService.forgotPassword(req.body.email);
    return ok(res, { message: result.message });
  } catch (error) {
    return handleServiceError(res, error, "Password");
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const result = await passwordService.resetPassword(req.body);
    return ok(res, { message: result.message });
  } catch (error) {
    return handleServiceError(res, error, "Password");
  }
};
