/**
 * Utility class exposing commonly used SDK constants.
 */
export default class Constants {
  /** MindsDB Cloud endpoint. */
  public static readonly BASE_CLOUD_API_ENDPOINT = 'https://cloud.mindsdb.com';

  /** MindsDB Cloud login endpoint. */
  public static readonly BASE_LOGIN_URI = '/cloud/login';

  /** MindsDB managed login endpoint. */
  public static readonly BASE_MANAGED_LOGIN_URI = '/api/login';

  /** MindsDB SQL query endpoint. */
  public static readonly BASE_SQL_URI = '/api/sql/query';

  /** MindsDB Projects endpoint. */
  public static readonly BASE_PROJECTS_URI = '/api/projects';

  // HTTP agent constants.

  /** How long to wait for an HTTP response before timeout. */
  public static readonly DEFAULT_HTTP_TIMEOUT_MS = 60 * 1000;

  /** Maximum number of socket connections per host. */
  public static readonly DEFAULT_MAX_SOCKETS_PER_HOST = 128;

  /** Maximum number of sockets per host to leave open in a free state. */
  public static readonly DEFAULT_MAX_FREE_SOCKETS = 128;

  /** Timeout active sockets after this period of inactivity. */
  public static readonly DEFAULT_ACTIVE_SOCKET_TIMEOUT_MS = 60 * 1000;

  /** Timeout free sockets after this period of inactivity. */
  public static readonly DEFAULT_FREE_SOCKET_TIMEOUT_MS = 30 * 1000;
}
