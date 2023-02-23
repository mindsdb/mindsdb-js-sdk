import axios, { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import HttpAuthenticator from '../../src/httpAuthenticator';
import {
  getCookieValue,
  getBaseRequestConfig,
  isMindsDbCloudEndpoint,
  retryUnauthenticatedRequest,
} from '../../src/util/http';

jest.mock('../../src/httpAuthenticator');
const mockedHttpAuthenticator =
  new HttpAuthenticator() as jest.Mocked<HttpAuthenticator>;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testing HTTP utils', () => {
  function makeAxiosError(code: HttpStatusCode): AxiosError {
    return {
      message: 'Test message',
      code: '',
      config: { headers: {} },
      request: undefined,
      response: { status: code },
    } as AxiosError;
  }

  afterEach(() => {
    mockedAxios.request.mockClear();
    mockedHttpAuthenticator.handleReauthentication.mockClear();
  });

  test('getBaseRequestConfig should include cookie header with session', () => {
    mockedHttpAuthenticator.session = 'test-session';
    expect(getBaseRequestConfig(mockedHttpAuthenticator)).toMatchObject({
      headers: {
        Cookie: 'session=test-session',
      },
    });
  });
  test('getBaseRequestConfig should not include cookie header if session undefined', () => {
    mockedHttpAuthenticator.session = undefined;
    expect(getBaseRequestConfig(mockedHttpAuthenticator)).toMatchObject({});
  });
  test('getCookieValue gets value of session cookie', () => {
    const allCookies = [
      'session=test-session; Domain=.mindsdb.com; Path=/',
      'unrelated=unrelated-value; Domain=.mindsdb.com; Path=/',
    ];
    expect(getCookieValue(allCookies, 'session')).toEqual('test-session');
  });
  test('getCookieValue returns undefined when cookie not present', () => {
    const allCookies = [
      'session=test-session; Domain=.mindsdb.com; Path=/',
      'unrelated=unrelated-value; Domain=.mindsdb.com; Path=/',
    ];
    expect(getCookieValue(allCookies, 'non-existent')).toBeUndefined();
  });
  test('isMindsDbCloudEndpoint returns true for cloud.mindsdb.com', () => {
    expect(isMindsDbCloudEndpoint('https://cloud.mindsdb.com')).toBeTruthy();
  });
  test('isMindsDbCloudEndpoint returns false for local endpoint', () => {
    expect(isMindsDbCloudEndpoint('https://127.0.0.1')).toBeFalsy();
  });
  test('retryUnauthenticatedRequest retries when needed', async () => {
    const unauthenticatedError = makeAxiosError(HttpStatusCode.Unauthorized);
    mockedHttpAuthenticator.handleReauthentication.mockResolvedValueOnce(true);
    mockedHttpAuthenticator.session = 'new-session';
    const expectedResponse = {
      data: ['test-data'],
      status: HttpStatusCode.Ok,
    } as AxiosResponse;

    mockedAxios.request.mockResolvedValueOnce(expectedResponse);

    const actualResponse = await retryUnauthenticatedRequest(
      unauthenticatedError,
      mockedAxios,
      mockedHttpAuthenticator
    );

    expect(mockedAxios.request).toHaveBeenCalled();

    const actualRequestConfig = mockedAxios.request.mock.calls[0][0];
    // We used the new session for the request.
    const headers = actualRequestConfig.headers || {};

    expect(headers['Cookie']).toEqual(`session=new-session`);
    expect(actualResponse).toMatchObject(expectedResponse);
  });
  test('retryUnauthenticatedRequest does not retry when not needed', async () => {
    const internalError = makeAxiosError(HttpStatusCode.ServiceUnavailable);
    mockedHttpAuthenticator.handleReauthentication.mockResolvedValueOnce(false);

    const retryPromise = retryUnauthenticatedRequest(
      internalError,
      mockedAxios,
      mockedHttpAuthenticator
    );
    await expect(retryPromise).rejects.toMatchObject(internalError);
    expect(mockedAxios.request).not.toHaveBeenCalled();
  });
});
