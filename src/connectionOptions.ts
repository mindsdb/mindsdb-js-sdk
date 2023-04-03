import { Axios } from 'axios';

/**
 * Options used for connecting to the MindsDB SDK.
 */
export default interface ConnectionOptions {
  /** MindsDB Cloud email to use for authentication. Use empty string if using local or remote host. */
  user: string;

  /** MindsDB Cloud password to use for authentication. Use empty string if using local or remote host. */
  password: string;

  /** Base endpoint to send requests through.
   *  e.g. https://cloud.mindsdb.com
   */
  host?: string;

  /** Is it a managed instance?
   * Defaults to false.
   */
  managed?: boolean,

  /**
   * Custom Axios client to use for sending API requests.
   */
  httpClient?: Axios;
}
