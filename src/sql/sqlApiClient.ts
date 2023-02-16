import SqlQueryResult from './sqlQueryResult';

/**
 * Abstract class outlining SQL API operations supported by the SDK.
 */
export default abstract class SqlApiClient {
  /**
   *
   * @param {string} sql - Raw SQL string to be executed.
   * @returns {Promise<SqlQueryResult>} - Result of executing the SQL query.
   * @throws {MindsDbError} - Something went wrong sending the API request..
   */
  abstract runQuery(sql: string): Promise<SqlQueryResult>;
}
