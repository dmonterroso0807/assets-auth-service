const WEAK_JWT_SECRET_HINTS = [
  "tu_jwt_secret_super_seguro_aqui",
  "secret",
  "changeme",
  "12345",
];

const isProduction = () => process.env.NODE_ENV === "production";

const collectProductionIssues = () => {
  const issues = [];

  const jwtSecret = process.env.JWT_SECRET || "";
  if (jwtSecret.length < 32) {
    issues.push(
      "JWT_SECRET debe tener al menos 32 caracteres en producción (usa un valor aleatorio, ej. `openssl rand -hex 32`).",
    );
  }
  if (
    WEAK_JWT_SECRET_HINTS.some((hint) => jwtSecret.toLowerCase().includes(hint))
  ) {
    issues.push(
      "JWT_SECRET parece ser el valor de ejemplo de .env.example, no un secreto real.",
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminPassword || adminPassword === "ADMINB") {
    issues.push(
      "ADMIN_PASSWORD sigue en el valor por defecto de ejemplo (ADMINB). Defínelo con una contraseña fuerte antes de desplegar.",
    );
  }

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").trim();
  if (!allowedOrigins) {
    issues.push(
      "CORS_ALLOWED_ORIGINS está vacío: ningún frontend podrá llamar a la API desde el navegador. Define los orígenes permitidos.",
    );
  }

  return issues;
};

export const assertProductionSafety = () => {
  if (!isProduction()) return;

  const issues = collectProductionIssues();
  if (issues.length === 0) return;

  console.error(
    "Fallo crítico de configuración: no se puede arrancar en producción con esta configuración:",
  );
  issues.forEach((issue) => console.error(`  - ${issue}`));
  process.exit(1);
};
