/**
 * Structure of the SQL query result returned by the SDK.
 */
export default interface SqlQueryResult {
  /** Ordered database column names for the response */
  columnNames: Array<string>;

  /** MindsDB context for database where the query is executed. */
  context?: object;

  /** Type of the response.
   *  'table' is for successful queries that return data.
   *  'ok' is for successful queries that don't return anything.
   *  'error' is for any queries that fail to execute.
   */
  type: 'table' | 'error' | 'ok';

  /** Data rows returned from the SQL query.
   *  Each row is a dictionary of column name to column value.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<Record<string, any>>;

  /** Error message if the SQL query failed. */
  error_message?: string;
}
