import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().trim().min(1, "El nombre de usuario es requerido"),
  password: z.string().trim().min(1, "La contraseña es requerida"),
});

export const registerClientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(50),
  userName: z.string().trim().min(4).max(50),
  dpi: z
    .string()
    .trim()
    .regex(/^\d{13}$/, "El DPI debe tener 13 dígitos"),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(150),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8}$/, "El celular debe tener 8 dígitos"),
  email: z.string().trim().email("El correo electrónico no es válido"),
  password: z
    .string()
    .min(8, "La contraseña es obligatoria")
    .max(50)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial",
    ),
  jobName: z
    .string()
    .trim()
    .min(1, "El nombre de trabajo es obligatorio")
    .max(100),
  monthlyIncome: z
    .number({ invalid_type_error: "El ingreso mensual debe ser un número" })
    .min(100, "El ingreso mensual debe ser mayor o igual a 100"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, "El refresh token es requerido"),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("El correo electrónico no es válido"),
});
