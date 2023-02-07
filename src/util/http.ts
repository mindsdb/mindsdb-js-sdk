import { AxiosRequestConfig } from 'axios';

/**
 * Gets the base HTTP request config to use for all REST API requests.
 * @param {string | undefined} session - Session to use for authentication. Only used for Cloud endpoints.
 * @returns {AxiosRequestConfig} - Request configuration compatible with Axios.
 */
function getBaseRequestConfig(session: string | undefined): AxiosRequestConfig {
  const requestConfig: AxiosRequestConfig = {};
  if (session) {
    requestConfig['headers'] = {
      Cookie: `session=${session}`,
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
  for (let i = 0; i < allCookies.length; i++) {
    const cookie = allCookies[i];
    const cookieComponents = cookie.split(';');
    for (let j = 0; j < cookieComponents.length; j++) {
      const component = cookieComponents[j].trim();
      const keyAndValue = component.split('=');
      if (keyAndValue[0] === cookieKey) {
        return keyAndValue[1];
      }
    }
  }
  return undefined;
}

/**
 * Determines whether or not the given URL is for MindsDB Cloud or not.
 * @param {string} - URL to test.url
 * @returns {boolean} - Whether or not the URL is a Cloud endpoint.
 */
function isMindsDbCloudEndpoint(url: string): boolean {
  // Cloud endpoints:
  // - https://cloud.mindsdb.com
  // - https://alpha.mindsdb.com
  // - https://beta.mindsdb.com
  return url.includes('mindsdb.com');
}

export { getBaseRequestConfig, getCookieValue, isMindsDbCloudEndpoint };
