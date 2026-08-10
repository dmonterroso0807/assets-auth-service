// ! Error de negocio controlado
// * Capturado por el controller para retornar el status HTTP adecuado en vez de 500.
// ? Ejemplos: credenciales inválidas, token expirado, permisos insuficientes.

export class ServiceError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}
