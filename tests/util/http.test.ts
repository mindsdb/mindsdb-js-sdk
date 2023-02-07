import {
  getCookieValue,
  getBaseRequestConfig,
  isMindsDbCloudEndpoint,
} from '../../src/util/http';

describe('Testing HTTP utils', () => {
  test('getBaseRequestConfig should include cookie header with session', () => {
    const session = 'test-session';
    expect(getBaseRequestConfig(session)).toMatchObject({
      headers: {
        Cookie: 'session=test-session',
      },
    });
  });
  test('getBaseRequestConfig should not include cookie header if session undefined', () => {
    const session = undefined;
    expect(getBaseRequestConfig(session)).toMatchObject({});
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
});
