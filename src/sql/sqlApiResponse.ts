/**
 * Structure of the API response data from the /api/sql/query endpoint.
 * @see {@link https://docs.mindsdb.com/rest/sql|query API docs}
 */
export default interface SqlApiResponse {
  /** Ordered database column names for the response */
  column_names: Array<string>;

  /** MindsDB context for database where the query is executed. */
  context?: object;

  /** Type of the response.
   *  'table' is for successful queries that return data.
   *  'ok' is for successful queries that don't return anything.
   *  'error' is for any queries that fail to execute.
   */
  type: 'table' | 'error' | 'ok';

  /** Actual data rows returned from the SQL query.
   *  Fields are in the same order as column names.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Array<any>>;

  /** Error code if the SQL API request failed. */
  error_code?: number;

  /** Error message if the SQL API request failed. */
  error_message?: string;
}
