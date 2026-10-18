/** An error whose message is safe to show to the user. */
export class AppError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const isDuplicateKey = (err) => err?.code === 11000;
