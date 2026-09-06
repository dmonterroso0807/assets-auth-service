import { z } from "zod";

// Se reutiliza en registro y en reset de contraseña, para no mantener el
// mismo regex duplicado en dos archivos.
export const strongPassword = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(50)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "La contraseña debe tener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial",
  );
