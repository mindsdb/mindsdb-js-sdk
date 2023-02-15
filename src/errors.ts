/** An error that occurs at the MindsDB level (e.g. API request, query execution). */
class MindsDbError extends Error {
  /**
   *
   * @param {string} message - Message to associate with the error.
   */
  constructor(message: string) {
    super(message);
    // See https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
    // for why this is needed.
    Object.setPrototypeOf(this, new.target.prototype);

    // Maintains proper stack trace for where our error was thrown (only available on V8).
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MindsDbError);
    }

    this.name = 'MindsDbError';
  }
}

export { MindsDbError };
