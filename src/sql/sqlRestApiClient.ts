import { Axios } from 'axios';

import SqlApiClient from './sqlApiClient';
import Constants from '../constants';
import SqlApiResponse from './sqlApiResponse';
import SqlQueryResult from './sqlQueryResult';
import { getBaseRequestConfig } from '../util/http';
import { MindsDbError } from '../errors';
import HttpAuthenticator from '../httpAuthenticator';

/**
 * Class to perform SQL operations through the REST API.
 * @see {@link https://docs.mindsdb.com/rest/sql|query API docs}
 */
export default class SqlRestApiClient extends SqlApiClient {
  /** Axios instance to send all requests. */
  client: Axios;

  /** Authenticator to use for reauthenticating if needed. */
  authenticator: HttpAuthenticator;

  /**
   *
   * @param {Axios} client - Axios instance used for all requests.
   */
  constructor(client: Axios, authenticator: HttpAuthenticator) {
    super();
    this.client = client;
    this.authenticator = authenticator;
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
    let respColumnNames = response['column_names'] || [];
    respColumnNames = respColumnNames.map((name) => name.toLowerCase());
    const queryResult: SqlQueryResult = {
      columnNames: respColumnNames,
      context: response['context'],
      type: response['type'],
      rows: [],
      error_message: response['error_message'],
    };

    const resultRows = [];
    const respData = response['data'] || [];
    for (let i = 0; i < respData.length; i++) {
      const rawRow = respData[i];
      // A row is a dictionary of column name to the corresponding value.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: Record<string, any> = {};
      for (let j = 0; j < rawRow.length; j++) {
        const colName = respColumnNames[j];
        const rowVal = rawRow[j];
        row[colName] = rowVal;
      }
      resultRows.push(row);
    }
    queryResult['rows'] = resultRows;
    return queryResult;
  }

  /**
   * Runs the given SQL query on the backend.
   * @param {string} query - The raw SQL query to run.
   * @returns {Promise<SqlQueryResult>} - A structured query result from running the raw SQL query.
   * @throws {MindsDbError} - Something went wrong sending the API request.
   */
  override async runQuery(query: string): Promise<SqlQueryResult> {
    const queryRequest = {
      query,
    };
    const { authenticator, client } = this;
    const queryUrl = this.getQueryUrl();
    try {
      const queryResponse = await client.post(
        queryUrl,
        queryRequest,
        getBaseRequestConfig(authenticator)
      );
      const responseData: SqlApiResponse = queryResponse.data;
      return this.makeQueryResult(responseData);
    } catch (error) {
      throw MindsDbError.fromHttpError(error, queryUrl);
    }
  }
}
