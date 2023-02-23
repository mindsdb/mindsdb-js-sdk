import MindsDB from '../src/index';
import axios from 'axios';
import Constants from '../src/constants';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testing root SDK functions', () => {
  afterEach(() => {
    mockedAxios.post.mockClear();
  });

  test('connect should authenticate for Cloud endpoint', async () => {
    mockedAxios.post.mockResolvedValue({
      headers: {
        // MindsDB Cloud login always returns a session cookie in response headers.
        'set-cookie': ['session=test-session; Domain=.mindsdb.com; Path=/'],
      },
    });
    await MindsDB.connect({
      user: 'test-user',
      password: 'test-password',
      httpClient: mockedAxios,
    });
    expect(mockedAxios.post).toHaveBeenCalled();

    const loginURL = new URL(
      Constants.BASE_LOGIN_URI,
      Constants.BASE_CLOUD_API_ENDPOINT
    ).toString();
    const argURL = mockedAxios.post.mock.calls[0][0];
    expect(argURL).toEqual(loginURL);

    const argData = mockedAxios.post.mock.calls[0][1];
    expect(argData).toMatchObject({
      email: 'test-user',
      password: 'test-password',
    });

    expect(MindsDB.SQL.authenticator.session).toEqual('test-session');
  });

  test('connect should not authenticate for custom endpoint', async () => {
    await MindsDB.connect({
      host: 'https://test-url.com',
      user: 'test-user',
      password: 'test-password',
      httpClient: mockedAxios,
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test('connect should override module default axios instance', async () => {
    await MindsDB.connect({
      user: 'test-user',
      password: 'test-password',
      httpClient: mockedAxios,
    });
    expect(MindsDB.SQL.client).toBe(mockedAxios);
  });
});
