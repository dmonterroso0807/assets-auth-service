import { z } from "zod";

export const updateAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(50).optional(),
    address: z.string().trim().min(1).max(150).optional(),
    jobName: z.string().trim().min(1).max(100).optional(),
    monthlyIncome: z
      .number({ invalid_type_error: "El ingreso mensual debe ser un número" })
      .min(100, "El ingreso mensual debe ser mayor o igual a 100")
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export const changeRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "CLIENT"], {
    message: "El rol debe ser SUPER_ADMIN, ADMIN o CLIENT",
  }),
});
