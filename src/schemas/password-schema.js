import { z } from "zod";
import { strongPassword } from "./shared-rules.js";

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("El correo electrónico no es válido"),
});

export const resetPasswordSchema = z.object({
  uid: z.string().trim().min(1, "El identificador de usuario es requerido"),
  token: z.string().trim().min(1, "El token de restablecimiento es requerido"),
  newPassword: strongPassword,
});
