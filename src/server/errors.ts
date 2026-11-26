/** Error yang pesannya aman ditampilkan ke kasir. */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
