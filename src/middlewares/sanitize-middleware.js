const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (isPlainObject(value)) {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        console.warn(
          `[ALERTA DE SEGURIDAD] Clave sospechosa bloqueada en el body: "${key}"`,
        );
        continue;
      }
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }

  return value;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body && isPlainObject(req.body)) {
    req.body = sanitizeValue(req.body);
  }
  next();
};
