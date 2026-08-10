export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Recurso no encontrado",
    error: "NOT_FOUND",
  });
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "El cuerpo de la petición no es JSON válido",
      error: "INVALID_JSON",
    });
  }

  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "El cuerpo de la petición es demasiado grande",
      error: "PAYLOAD_TOO_LARGE",
    });
  }

  console.error("Error no controlado:", err);

  res.status(err?.status || 500).json({
    success: false,
    message: "Error interno del servidor",
    error: "INTERNAL_ERROR",
  });
};
