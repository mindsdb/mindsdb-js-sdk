import SqlApiClient from '../sql/sqlApiClient';
import Table from './table';
import TablesApiClient from './tablesApiClient';
import mysql from 'mysql';
import { MindsDbError } from '../errors';
import HttpAuthenticator from '../httpAuthenticator';
import { Axios } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import Constants from '../constants';
import { getBaseRequestConfig } from '../util/http';
import path from 'path';

/** Implementation of TablesApiClient that goes through the REST API */
export default class TablesRestApiClient extends TablesApiClient {
  /** SQL API client to send all SQL query requests. */
  sqlClient: SqlApiClient;

  /** Axios instance to send all requests. */
  client: Axios;

  /** Authenticator to use for reauthenticating if needed. */
  authenticator: HttpAuthenticator;

  /**
   *
   * @param {SqlApiClient} sqlClient - SQL API client to send all SQL query requests.
   */
  constructor(
    sqlClient: SqlApiClient,
    client: Axios,
    authenticator: HttpAuthenticator
  ) {
    super();
    this.sqlClient = sqlClient;
    this.client = client;
    this.authenticator = authenticator;
  }

  /**
   * Creates a table in an integration from a given SELECT statement.
   * @param {string} name - Name of table to be created.
   * @param {string} integration - Name of integration the table will be a part of.
   * @param {string} select - SELECT statement to use for populating the new table with data.
   * @returns {Promise<Table>} - Newly created table.
   * @throws {MindsDbError} - Something went wrong creating the table.
   */
  override async createTable(
    name: string,
    integration: string,
    select: string
  ): Promise<Table> {
    const createClause = `CREATE TABLE ${mysql.escapeId(
      integration
    )}.${mysql.escapeId(name)}`;
    const selectClause = `(${select})`;
    const sqlQuery = [createClause, selectClause].join('\n');

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return new Table(this, name, integration);
  }

  /**
   * Creates a table in an integration from a given SELECT statement. If the table already exists, it is
   * deleted first and then recreated.
   * @param {string} name - Name of table to be created/replaced.
   * @param {string} integration - Name of integration the table will be a part of.
   * @param {string} select - SELECT statement to use for populating the new/replaced table with data.
   * @returns {Promise<Table>} - Newly created/replaced table.
   * @throws {MindsDbError} - Something went wrong creating or replacing the table.
   */
  override async createOrReplaceTable(
    name: string,
    integration: string,
    select: string
  ): Promise<Table> {
    const createOrReplaceClause = `CREATE OR REPLACE TABLE ${mysql.escapeId(
      integration
    )}.${mysql.escapeId(name)}`;
    const selectClause = `(${select})`;
    const sqlQuery = [createOrReplaceClause, selectClause].join('\n');

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return new Table(this, name, integration);
  }

  /**
   * Deletes a table from its integration.
   * @param {string} name - Name of the table to be deleted.
   * @param {string} integration - Name of the integration the table to be deleted is a part of.
   * @throws {MindsDbError} - Something went wrong deleting the table.
   */
  override async deleteTable(name: string, integration: string): Promise<void> {
    const sqlQuery = `DROP TABLE ${mysql.escapeId(
      integration
    )}.${mysql.escapeId(name)}`;

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  /**
   * Deletes a file from the files integration.
   * @param {string} name - Name of the file to be deleted.
   * @throws {MindsDbError} - Something went wrong deleting the file.
   */
  override async deleteFile(name: string): Promise<void> {
    const sqlQuery = `DROP TABLE files.${mysql.escapeId(name)}`;

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  private getFilesUrl(): string {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const filesUrl = new URL(Constants.FILES_URI, baseUrl);
    return filesUrl.toString();
  }
  
  override async uploadFile(filePath: string, fileName: string, original_file_name ?: string): Promise<void> {
    const formData = new FormData();

    if(original_file_name)
      formData.append('original_file_name', original_file_name);

    if (fs.existsSync(filePath)) {
      formData.append('file', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: 'multipart/form-data',
      });
    } else {
      console.error('File does not exist:', filePath);
    }

    // Axios request configuration
    const { authenticator, client } = this;

    const config = getBaseRequestConfig(authenticator);
    const filesUrl = this.getFilesUrl();
    config.method = 'PUT';
    config.url = `${filesUrl}/${fileName}`;
    (config.headers = {
      ...config.headers,
      ...formData.getHeaders(),
    }),
      (config.data = formData);

    try {
      const uploadFileResponse = await client.request(config);
      console.log(JSON.stringify(uploadFileResponse, null, 2));
    } catch (error) {
      console.error(error);
      throw MindsDbError.fromHttpError(error, filesUrl);
    }

  }

}
