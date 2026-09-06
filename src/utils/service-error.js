export class ServiceError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
  }
}
