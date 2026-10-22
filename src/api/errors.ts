export type ApiErrorCode =
  | "network"
  | "timeout"
  | "unauthorized"
  | "validation"
  | "not_found"
  | "server"
  | "upload"
  | "unknown";

export class ApiError extends Error {
  code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}