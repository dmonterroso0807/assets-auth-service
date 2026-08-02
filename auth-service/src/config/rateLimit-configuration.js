import rateLimit from "express-rate-limit";

export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false, // Mejora de rendimiento: apaga cabeceras antiguas (X-RateLimit-*)
  handler: (req, res) => {
    console.warn(
      `[ALERTA DE SEGURIDAD] Fuerza bruta prevenida - IP: ${req.ip}, Ruta: ${req.path}`,
    );
    res.status(429).json({
      success: false,
      message:
        "Demasiados intentos fallidos. Por tu seguridad, tu acceso temporalmente bloqueado. Intenta más tarde.",
      error: "RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});
