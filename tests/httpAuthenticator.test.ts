import axios, { AxiosError, HttpStatusCode } from 'axios';
import HttpAuthenticator from '../src/httpAuthenticator';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testing HTTP Authenticator', () => {
  function makeAxiosError(code: HttpStatusCode): AxiosError {
    return {
      message: 'Test message',
      code: '',
      config: { headers: {} },
      request: undefined,
      response: { status: code },
    } as AxiosError;
  }
  test('reauthenticates for 401 requests', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      headers: {
        // MindsDB Cloud login always returns a session cookie in response headers.
        'set-cookie': ['session=new-session; Domain=.mindsdb.com; Path=/'],
      },
    });

    const authenticator = new HttpAuthenticator();
    authenticator.session = 'old-session';
    const unauthError = makeAxiosError(HttpStatusCode.Unauthorized);

    const reauthenticated = await authenticator.handleReauthentication(
      mockedAxios,
      unauthError
    );
    expect(reauthenticated).toBe(true);
  });
  test('reauthenticates for 403 requests', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      headers: {
        // MindsDB Cloud login always returns a session cookie in response headers.
        'set-cookie': ['session=new-session; Domain=.mindsdb.com; Path=/'],
      },
    });

    const authenticator = new HttpAuthenticator();
    authenticator.session = 'old-session';
    const unauthError = makeAxiosError(HttpStatusCode.Forbidden);

    const reauthenticated = await authenticator.handleReauthentication(
      mockedAxios,
      unauthError
    );
    expect(reauthenticated).toBe(true);
    expect(authenticator.session).toEqual('new-session');
  });
  test('does not reauthenticate for irrelevant errors', async () => {
    const authenticator = new HttpAuthenticator();
    authenticator.session = 'old-session';
    const internalError = makeAxiosError(HttpStatusCode.InternalServerError);

    const reauthenticated = await authenticator.handleReauthentication(
      mockedAxios,
      internalError
    );
    expect(reauthenticated).toBe(false);
  });
});
