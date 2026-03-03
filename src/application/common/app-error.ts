export class AppError extends Error {
  public readonly statusCode: number
  public readonly payload: Record<string, unknown>

  constructor(statusCode: number, payload: Record<string, unknown>) {
    super(String(payload.code ?? 'APP_ERROR'))
    this.statusCode = statusCode
    this.payload = payload
  }
}
