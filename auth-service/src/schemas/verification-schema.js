import { z } from "zod";

export const verifyEmailSchema = z.object({
  uid: z.string().trim().min(1, "El identificador de usuario es requerido"),
  token: z.string().trim().min(1, "El token de verificación es requerido"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("El correo electrónico no es válido"),
});
