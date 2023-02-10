/**
 * Utility class exposing commonly used SDK constants.
 */
export default class Constants {
  /** MindsDB Cloud endpoint. */
  public static readonly BASE_CLOUD_API_ENDPOINT = 'https://cloud.mindsdb.com';

  /** MindsDB Cloud login endpoint. */
  public static readonly BASE_LOGIN_URI = '/cloud/login';

  /** MindsDB SQL query endpoint. */
  public static readonly BASE_SQL_URI = '/api/sql/query';

  /** MindsDB Projects endpoint. */
  public static readonly BASE_PROJECTS_URI = '/api/projects';
}
