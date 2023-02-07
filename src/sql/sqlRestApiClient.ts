import { Axios } from 'axios';

import SqlApiClient from './sqlApiClient';
import Constants from '../constants';
import SqlApiResponse from './sqlApiResponse';
import SqlQueryResult from './sqlQueryResult';
import { getBaseRequestConfig } from '../util/http';

/**
 * Class to perform SQL operations through the REST API.
 * @see {@link https://docs.mindsdb.com/rest/sql|query API docs}
 */
export default class SqlRestApiClient extends SqlApiClient {
  /** Axios instance to send all requests. */
  client: Axios;

  /** Session used for authentication. Used only for Cloud host. */
  session: string | undefined;

  /**
   *
   * @param {Axios} client - Axios instance used for all requests.
   */
  constructor(client: Axios) {
    super();
    this.client = client;
  }

  /**
   * @returns {string} SQL query endpoint to send API requests to.
   */
  private getQueryUrl(): string {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const queryUrl = new URL(Constants.BASE_SQL_URI, baseUrl);
    return queryUrl.toString();
  }

  /**
   * Returns a structured query result from the raw SQL query API response.
   * @param {SqlApiResponse} response - The raw API response data from the /api/sql/query endpoint.
   * @returns {SqlQueryResult} - A structured query result in an easier to use format.
   */
  private makeQueryResult(response: SqlApiResponse): SqlQueryResult {
    const respColumnNames = response['column_names'].map((name) =>
      name.toLowerCase()
    );
    const queryResult: SqlQueryResult = {
      columnNames: respColumnNames,
      context: response['context'],
      type: response['type'],
      rows: [],
    };

    const resultRows = [];
    const respData = response['data'];
    for (let i = 0; i < respData.length; i++) {
      const row = respData[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultRow: Record<string, any> = {};
      for (let j = 0; j < row.length; j++) {
        resultRow[respColumnNames[j]] = row[j];
      }
      resultRows.push(resultRow);
    }
    queryResult['rows'] = resultRows;
    return queryResult;
  }

  /**
   * Runs the given SQL query on the backend.
   * @param {string} query - The raw SQL query to run.
   * @returns {Promise<SqlQueryResult>} - A structured query result from running the raw SQL query.
   */
  override async runQuery(query: string): Promise<SqlQueryResult> {
    const queryRequest = {
      query,
    };
    const queryResponse = await this.client.post(
      this.getQueryUrl(),
      queryRequest,
      getBaseRequestConfig(this.session)
    );
    const responseData: SqlApiResponse = queryResponse.data;
    return this.makeQueryResult(responseData);
  }
}
