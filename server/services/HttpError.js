/** Status-carrying error; the central error handler maps it to { message }. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default HttpError;
