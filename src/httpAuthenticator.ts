import { Axios, AxiosError, HttpStatusCode } from 'axios';
import Constants from './constants';
import { getCookieValue } from './util/http';

/** Handles HTTP authentication and reauthentication for MindsDB Cloud. */
export default class HttpAuthenticator {
  /** Session used for authentication. */
  session: string | undefined;

  /** MindsDB email used for authentication. */
  user = '';

  /** MindsDB password used for authentication. */
  password = '';

  /** MindsDb managed instance */
  managed = false;

  /**
   * Logs into MindsDB Cloud and stores the returned session.
   * @param {Axios} axiosClient - Axios instance to use when sending login request.
   * @param {string} user - MindsDB email to use for logging in.
   * @param {string} password - MindsDB password to use for logging in.
   */
  async authenticate(
    axiosClient: Axios,
    user: string,
    password: string,
    managed?: boolean
  ): Promise<void> {
    this.user = user;
    this.password = password;
    this.managed = managed || false;
    const baseURL =
      axiosClient.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const loginURL = new URL(
      managed ? Constants.BASE_MANAGED_LOGIN_URI : Constants.BASE_LOGIN_URI,
      baseURL
    );
    const loginResponse = await axiosClient.post(loginURL.href, {
      email: this.user,
      username: this.user,
      password: this.password,
    });
    this.session = getCookieValue(
      loginResponse.headers['set-cookie'] || [],
      'session'
    );
  }

  /**
   *
   * @param {Axios} axiosClient - Axios instance to use when sending login request.
   * @param {any} error - Original error to inspect for determining if we need to reauthenticate.
   * @returns - True if we successfully reauthenticated, false if not needed.
   */
  async handleReauthentication(
    axiosClient: Axios,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ): Promise<boolean> {
    if (!this.session || !error) {
      // We never needed to authenticate to begin with.
      return false;
    }
    if (
      !error.response ||
      (error.response.status != HttpStatusCode.Unauthorized &&
        error.response.status != HttpStatusCode.Forbidden)
    ) {
      // Only reauthenticate for 401/403 responses.
      return false;
    }
    console.info('MindsDB HTTP session expired. Reauthenticating...');
    await this.authenticate(
      axiosClient,
      this.user,
      this.password,
      this.managed
    );
    console.info('Successfully reauthenticated.');
    return true;
  }
}
