export const ok = (res, { message = "OK", data = null, status = 200 } = {}) =>
  res.status(status).json({ success: true, message, data });

export const fail = (
  res,
  {
    message = "Ha ocurrido un error",
    status = 400,
    error = "BAD_REQUEST",
    details = null,
  } = {},
) => res.status(status).json({ success: false, message, error, details });
