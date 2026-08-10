import rateLimit from "express-rate-limit";

export const rateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
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
export const emailSendingRateLimitConfig = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(
      `[ALERTA DE SEGURIDAD] Límite de envío de correos alcanzado - IP: ${req.ip}, Ruta: ${req.path}`,
    );
    res.status(429).json({
      success: false,
      message: "Demasiadas solicitudes de correo. Intenta de nuevo más tarde.",
      error: "EMAIL_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

export const tokenRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(
      `[ALERTA DE SEGURIDAD] Demasiados intentos de canje de token - IP: ${req.ip}, Ruta: ${req.path}`,
    );
    res.status(429).json({
      success: false,
      message: "Demasiados intentos. Intenta de nuevo más tarde.",
      error: "TOKEN_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

export const loginRateLimitConfig = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(
      `[ALERTA DE SEGURIDAD] Posible fuerza bruta en login - IP: ${req.ip}`,
    );
    res.status(429).json({
      success: false,
      message: "Demasiados intentos de inicio de sesión. Intenta más tarde.",
      error: "LOGIN_RATE_LIMIT_EXCEEDED",
      retryAfter: req.rateLimit.resetTime,
    });
  },
});
