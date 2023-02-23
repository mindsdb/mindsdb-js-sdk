import { AxiosError, HttpStatusCode } from 'axios';

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

  private static getBaseAxiosErrorMessage(axiosError: AxiosError): string {
    return `Request failed with status code ${axiosError.response?.status}. `;
  }

  /**
   * Creates a MindsDB error from an AxiosError, with a more readable error message.
   * @param {AxiosError} axiosError - Original Axios Error
   * @returns {MindsDbError} - New MindsDB error.
   */
  static fromAxiosError(axiosError: AxiosError): MindsDbError {
    const baseMsg = MindsDbError.getBaseAxiosErrorMessage(axiosError);
    if (axiosError.response) {
      // Request was made and server responded with non-2xx status code.
      switch (axiosError.response.status) {
        case HttpStatusCode.BadRequest:
          return new MindsDbError(
            `${baseMsg} MindsDB received an invalid request and can't process it.`
          );
        case HttpStatusCode.Unauthorized:
          return new MindsDbError(
            `${baseMsg} Did you provide the right username and password to the 'connect' method before using the SDK?`
          );
        case HttpStatusCode.Forbidden:
          return new MindsDbError(
            `${baseMsg} You don't have permission to access this resource. Did you provide the right username and password to the 'connect' method before using the SDK?`
          );
        case HttpStatusCode.NotFound:
          return new MindsDbError(
            `${baseMsg} This MindsDB resource doesn't exist.`
          );
        case HttpStatusCode.TooManyRequests:
          return new MindsDbError(
            `${baseMsg} The number of requests you sent has exceeded the MindsDB API limit. Please contact us to request a limit increase.`
          );
        case HttpStatusCode.RequestTimeout:
        case HttpStatusCode.GatewayTimeout:
          return new MindsDbError(
            `${baseMsg} The request took too long to complete. Please try again.`
          );
        case HttpStatusCode.InternalServerError:
        case HttpStatusCode.BadGateway:
        case HttpStatusCode.ServiceUnavailable:
          return new MindsDbError(
            `${baseMsg} Oops! Something went wrong on our end. Please try again.`
          );
        default:
          return new MindsDbError(
            `${baseMsg} Full message: ${axiosError.message}`
          );
      }
    } else if (axiosError.request) {
      // Request was made but no response was received.
      return new MindsDbError(
        `The request was made but no response was received. Something may be wrong on our end. Please try again.`
      );
    }
    return new MindsDbError(axiosError.message);
  }

  /**
   * Creates a MindsDB error from an error thrown during an HTTP request, with a more readable error message.
   * @param {AxiosError} axiosError - Original HTTP Error
   * @returns {MindsDbError} - New MindsDB error.
   */
  static fromHttpError(error: unknown, url: string): MindsDbError {
    if (error instanceof AxiosError) {
      return MindsDbError.fromAxiosError(error);
    }
    return new MindsDbError(
      `Something went wrong handling HTTP POST request to ${url}: ${error}`
    );
  }
}

export { MindsDbError };
