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
   * Removes a table from its integration.
   * @param {string} name - Name of the table to be removed.
   * @param {string} integration - Name of the integration the table to be removed is a part of.
   * @throws {MindsDbError} - Something went wrong removing the table.
   */
  override async removeTable(name: string, integration: string): Promise<void> {
    await this.deleteTable(name, integration);
  }


  /**
   * Updates a table from its integration.
   * @param {string} name - Name of the table to be updated.
   * @param {string} integration - Name of the integration the table to be updated is a part of.
   * @param {string} updateQuery - The SQL UPDATE query to run for updating the table.
   * @throws {MindsDbError} - Something went wrong deleting the table.
   */
  override async updateTable(
    name: string,
    integration: string,
    updateQuery: string
  ): Promise<void> {

    let keyword = "SET";
    let setPosition = updateQuery.toUpperCase().indexOf(keyword);
    let result;

    if (setPosition !== -1) {
      // Extract the substring starting just after "SET"
      result = updateQuery.substring(setPosition + keyword.length).trim();
    }

    // Construct the full SQL query to update the table
    const sqlQuery = `UPDATE ${mysql.escapeId(integration)}.${mysql.escapeId(name)} SET ${result}`;

    // Execute the SQL query using the sqlClient
    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }


  /*
   * Deletes specific row (or multiple rows) from the table present in the given integration.
   * @param {string} name - Name of the table from which data is to be deleted.
   * @param {string} integration - Name of the integration the table is a part of.
   * @param {string} select - select statement to specify which rows should be deleted.
   * @throws {MindsDbError} - Something went wrong deleting the data from the table.
   */
  override async deleteFromTable(name: string, integration: string, select?: string): Promise<void> {
    /** If select parameter is not passed then entire data from the table is deleted.
    */
    const sqlQuery = select ?? `DELETE FROM TABLE ${mysql.escapeId(
      integration
    )}.${mysql.escapeId(name)}`;
    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }


  /*
 * Insert data into this table.
 * @param {Array<Array<any>> | string} data - A 2D array of values to insert, or a SELECT query to insert data from.
 * @throws {MindsDbError} - Something went wrong inserting data into the table.
 */
  override async insertTable(name: string, integration: string, select: string): Promise<void> {
    try {
      const sqlQuery = `INSERT INTO ${mysql.escapeId(
        integration
      )}.${mysql.escapeId(name)} (${select})`;
      const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
      if (sqlQueryResult.error_message) {
        throw new MindsDbError(sqlQueryResult.error_message);
      }
    } catch (error) {
      throw new MindsDbError(`Insert into a table failed: ${error}`);
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

  /**
   * Uploads a file asynchronously to a specified location.
   *
   * This method handles the process of uploading a file to a server or cloud storage. It requires the path to the
   * file on the local filesystem, the desired name for the uploaded file, and optionally, the original name of the file.
   * The file will be uploaded with the specified file name, but the original file name can be preserved if provided.
   *
   * @param {string} filePath - The local path to the file to be uploaded.
   * @param {string} fileName - The desired name for the file once it is uploaded.
   * @param {string} [original_file_name] - (Optional) The original name of the file before renaming. This is typically
   * used for logging, tracking, or maintaining the original file's identity.
   * * @returns {Promise<void>} A promise that resolves when the file upload is complete. If the upload fails,
   * an error will be thrown.
   *
   * @throws {Error} If there is an issue with the upload, such as network errors, permission issues, or invalid file paths.
   */
  override async uploadFile(filePath: string, fileName: string, original_file_name?: string): Promise<void> {
    const formData = new FormData();

    if (original_file_name)
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
    } catch (error) {
      console.error(error);
      throw MindsDbError.fromHttpError(error, filesUrl);
    }

  }

}