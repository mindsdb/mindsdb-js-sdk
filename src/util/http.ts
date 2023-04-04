import axios, {
  Axios,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import Agent, { HttpsAgent } from 'agentkeepalive';
import Constants from '../constants';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';

/**
 * Creates the default Axios instance to use for all SDK HTTP requests.
 * @returns {Axios} - Axios instance with sensible defaults.
 */
function createDefaultAxiosInstance(): Axios {
  const keepAliveAgent = new Agent({
    maxSockets: Constants.DEFAULT_MAX_SOCKETS_PER_HOST,
    maxFreeSockets: Constants.DEFAULT_MAX_FREE_SOCKETS,
    timeout: Constants.DEFAULT_ACTIVE_SOCKET_TIMEOUT_MS,
    freeSocketTimeout: Constants.DEFAULT_FREE_SOCKET_TIMEOUT_MS,
  });
  const httpsKeepAliveAgent = new HttpsAgent({
    maxSockets: Constants.DEFAULT_MAX_SOCKETS_PER_HOST,
    maxFreeSockets: Constants.DEFAULT_MAX_FREE_SOCKETS,
    timeout: Constants.DEFAULT_ACTIVE_SOCKET_TIMEOUT_MS,
    freeSocketTimeout: Constants.DEFAULT_FREE_SOCKET_TIMEOUT_MS,
  });
  return axios.create({
    baseURL: Constants.BASE_CLOUD_API_ENDPOINT,
    timeout: Constants.DEFAULT_HTTP_TIMEOUT_MS,
    httpAgent: keepAliveAgent,
    httpsAgent: httpsKeepAliveAgent,
  });
}
/**
 * Gets the base HTTP request config to use for all REST API requests.
 * @param {HttpAuthenticator} authenticator - HTTP authenticator used for authentication. Only used for Cloud endpoints.
 * @returns {AxiosRequestConfig} - Request configuration compatible with Axios.
 */
function getBaseRequestConfig(
  authenticator: HttpAuthenticator
): AxiosRequestConfig {
  const requestConfig: AxiosRequestConfig = {};
  if (authenticator.session) {
    requestConfig['headers'] = {
      Cookie: `session=${authenticator.session}`,
    };
  }
  return requestConfig;
}

/**
 * Gets the value of the given cookie key from all response cookies.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6265#section-3.1|Cookies RFC} for example of cookie syntax.
 * @param {Array<string>} allCookies - All response cookies.
 * @param {string} cookieKey - Name of cookie to retrieve.
 * @returns {string | undefined} - Value of given cookie, or undefined if not present.
 */
function getCookieValue(
  allCookies: Array<string>,
  cookieKey: string
): string | undefined {
  const allCookieComponents = allCookies.map((c) => c.split(';'));
  for (let i = 0; i < allCookieComponents.length; i++) {
    const keysAndValues = allCookieComponents[i].map((comp) =>
      comp.trim().split('=')
    );
    // First key-value pair is the cookie value. Rest are keys like Domain, Path, etc.
    if (keysAndValues[0][0] === cookieKey) {
      return keysAndValues[0][1];
    }
  }
  return undefined;
}

/**
 * Determines whether or not the given URL is for MindsDB Cloud or not.
 * @param {string} - URL to test.
 * @returns {boolean} - Whether or not the URL is a Cloud endpoint.
 */
function isMindsDbCloudEndpoint(url: string): boolean {
  // Cloud endpoints:
  // - https://cloud.mindsdb.com
  // - https://alpha.mindsdb.com
  // - https://beta.mindsdb.com
  return url.includes('mindsdb.com');
}

/**
 * Determines whether or not the given URL is a local URL.
 * @param {string} - URL to test.
 * @returns {boolean} - Whether or not the URL is a local endpoint.
 */
function isLocalEndpoint(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

/**
 * Retries requests once that failed for authentication reasons (unauthorized/forbidden).
 * @param {AxiosError} error - Error returned from HTTP request.
 * @param {Axios} client - Axios client to handle reauthentication requests.
 * @param {HttpAuthenticator} authenticator - Authenticator to use for reauthenticating.
 * @returns {AxiosResponse} - Response for retrying original request that failed.
 */
async function retryUnauthenticatedRequest(
  error: AxiosError,
  client: Axios,
  authenticator: HttpAuthenticator
): Promise<AxiosResponse> {
  if (!error.config) {
    throw error;
  }
  const originalRequestConfig: InternalAxiosRequestConfig & {
    _retried?: boolean;
  } = error.config;
  if (
    !originalRequestConfig._retried &&
    (await authenticator.handleReauthentication(client, error))
  ) {
    originalRequestConfig.headers[
      'Cookie'
    ] = `session=${authenticator.session}`;
    originalRequestConfig._retried = true;
    return client.request(originalRequestConfig);
  }
  throw error;
}

export {
  createDefaultAxiosInstance,
  getBaseRequestConfig,
  getCookieValue,
  isLocalEndpoint,
  isMindsDbCloudEndpoint,
  retryUnauthenticatedRequest,
};
