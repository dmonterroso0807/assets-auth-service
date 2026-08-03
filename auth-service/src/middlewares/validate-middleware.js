import { fail } from "../utils/apiResponse.util.js";

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return fail(res, {
      message: "Datos inválidos",
      status: 400,
      error: "VALIDATION_ERROR",
      details,
    });
  }

  req.body = result.data;
  next();
};
