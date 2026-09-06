const parseAllowedOrigins = () =>
  (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = parseAllowedOrigins();

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[ALERTA DE SEGURIDAD] Origin bloqueado por CORS: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
