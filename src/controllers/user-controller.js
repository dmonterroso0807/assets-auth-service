import * as userService from "../services/user-service.js";
import { ok } from "../utils/apiResponse.util.js";
import { handleServiceError } from "../utils/handle-service-error.js";

export const listUsersController = async (req, res) => {
  try {
    const users = await userService.listUsers();
    return ok(res, { message: "Usuarios obtenidos exitosamente", data: users });
  } catch (error) {
    return handleServiceError(res, error, "User");
  }
};

export const updateAccountController = async (req, res) => {
  try {
    const updatedUser = await userService.updateAccount(
      req.user,
      req.params.userName,
      req.body,
    );
    return ok(res, {
      message: "Cuenta actualizada exitosamente",
      data: updatedUser,
    });
  } catch (error) {
    return handleServiceError(res, error, "User");
  }
};

export const changeRoleController = async (req, res) => {
  try {
    const updatedUser = await userService.changeUserRole(
      req.user,
      req.params.userName,
      req.body.role,
    );
    return ok(res, {
      message: "Rol actualizado exitosamente",
      data: updatedUser,
    });
  } catch (error) {
    return handleServiceError(res, error, "User");
  }
};
