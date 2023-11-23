import mysql from 'mysql';

import SqlApiClient from '../sql/sqlApiClient';
import { MindsDbError } from '../errors';
import MLEngine from './ml_engine';
import MLEngineApiClient from './ml_enginesApiClient';
import { Axios } from 'axios';
import HttpAuthenticator from '../httpAuthenticator';
import Constants from '../constants';
import * as fs from 'fs';
import FormData from 'form-data';
import * as path from 'path'; // Import the path module
import { Readable } from 'stream';
import { getBaseRequestConfig } from '../util/http';

/** Implementation of MLEnginesApiClient that goes through the REST API. */
export default class MLEnginesRestApiClient extends MLEngineApiClient {
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /** Authenticator to use for reauthenticating if needed. */
  authenticator: HttpAuthenticator;

  /** SQL API client to send all SQL query requests. */
  sqlClient: SqlApiClient;

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

  private getMLEnginesUrl(): string {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const mlEnginesUrl = new URL(Constants.BASE_MLENGINES_URI, baseUrl);
    return mlEnginesUrl.toString();
  }

  /**
   * Updates a mlEngine with the given name, engine, and parameters.
   * @param {string} name - Name of the MLEngine to be created.
   * @param {string | Readable} [codeFilePath] - Path to the code file or Readable of to be used for the mlEngine.
   * @param {string | Readable} [modulesFilePath] - Path to the modules file or Readable of to be used for the mlEngine.
   * @returns {Promise<MLEngine>} - Newly created mlEngine.
   * @throws {MindsDbError} - Something went wrong creating the mlEngine.
   */
  override async updateMLEngine(
    name: string, // This is the variable that will be used in the URL
    codeFilePath: string | Readable,
    modulesFilePath: string | Readable,
    type: 'venv' | 'inhouse' = 'inhouse'
  ): Promise<MLEngine | undefined> {
    return this.createOrUpdateMLEngine(
      'post',
      name,
      codeFilePath,
      modulesFilePath,
      type
    );
  }

  private async createOrUpdateMLEngine(
    httpMethod: 'post' | 'put',
    name: string,
    codeFilePathOrStream: string | Readable,
    modulesFilePathOrStream: string | Readable,
    type: 'venv' | 'inhouse' = 'inhouse'
  ): Promise<MLEngine | undefined> {
    const formData = new FormData();

    formData.append('source', name);
    formData.append('type', type);

    // Append the 'code' file part, checking if it's a stream or a string
    if (codeFilePathOrStream instanceof Readable) {
      formData.append('code', codeFilePathOrStream, {
        filename: 'model.py', // Provide an appropriate default filename or derive from context
        contentType: 'text/x-python-script',
      });
    } else if (typeof codeFilePathOrStream === 'string') {
      if (fs.existsSync(codeFilePathOrStream)) {
        formData.append('code', fs.createReadStream(codeFilePathOrStream), {
          filename: path.basename(codeFilePathOrStream),
          contentType: 'text/x-python-script',
        });
      } else {
        console.error('File does not exist:', codeFilePathOrStream);
      }
    }

    // Append the 'modules' file part, checking if it's a stream or a string
    if (modulesFilePathOrStream instanceof Readable) {
      formData.append('modules', modulesFilePathOrStream, {
        filename: 'requirements.txt', // Provide an appropriate default filename or derive from context
        contentType: 'text/plain',
      });
    } else if (typeof modulesFilePathOrStream === 'string') {
      if (fs.existsSync(modulesFilePathOrStream)) {
        formData.append(
          'modules',
          fs.createReadStream(modulesFilePathOrStream),
          {
            filename: path.basename(modulesFilePathOrStream),
            contentType: 'text/plain',
          }
        );
      } else {
        console.error('File does not exist:', modulesFilePathOrStream);
      }
    }

    // Axios request configuration
    const { authenticator, client } = this;

    const config = getBaseRequestConfig(authenticator);
    const mlEngineUrl = this.getMLEnginesUrl();
    config.method = httpMethod;
    config.url = `${mlEngineUrl}/${encodeURIComponent(name)}`;
    (config.headers = {
      ...config.headers,
      ...formData.getHeaders(),
    }),
      (config.data = formData);

    try {
      const mlEnginesResponse = await client.request(config);
      console.log(JSON.stringify(mlEnginesResponse.data, null, 2));
      if (mlEnginesResponse.status === 200) {
        return this.getMLEngine(name);
      }
      return mlEnginesResponse.data;
    } catch (error) {
      console.error(error);
      throw MindsDbError.fromHttpError(error, mlEngineUrl);
    }
  }

  /**
   * Creates a mlEngine with the given name, engine, and parameters.
   * @param {string} name - Name of the MLEngine to be created.
   * @param {string | Readable} [codeFilePath] - Path to the code file or Readable of to be used for the mlEngine.
   * @param {string | Readable} [modulesFilePath] - Path to the modules file or Readable of to be used for the mlEngine.
   * @param {string} [type] - Type of the mlEngine to be created.
   * @returns {Promise<MLEngine>} - Newly created mlEngine.
   * @throws {MindsDbError} - Something went wrong creating the mlEngine.
   */
  override async createMLEngine(
    name: string, // This is the variable that will be used in the URL
    codeFilePath: string | Readable,
    modulesFilePath: string | Readable,
    type: 'venv' | 'inhouse' = 'inhouse'
  ): Promise<MLEngine | undefined> {
    return this.createOrUpdateMLEngine(
      'put',
      name,
      codeFilePath,
      modulesFilePath,
      type
    );
  }

  // Usage example:
  // uploadModel('myEngineName', '/path/to/code.py', '/path/to/requirements.txt');

  /**
   * Gets all mlEngines for the authenticated user.
   * @returns {Promise<Array<MLEngine>>} - All mlEngines for the user.
   */
  override async getAllMLEngines(): Promise<Array<MLEngine>> {
    const showMLEnginesQuery = `SHOW ML_ENGINES`;
    const sqlQueryResponse = await this.sqlClient.runQuery(showMLEnginesQuery);
    return sqlQueryResponse.rows.map(
      (r) =>
        new MLEngine(
          this,
          r['name'],
          r['handler'],
          this.parseJson(r['connection_data'] as string)
        )
    );
  }

  /**
   * Gets a mlEngine by name for the authenticated user.
   * @param {string} name - Name of the mlEngine.
   * @returns {Promise<MLEngine | undefined>} - Matching mlEngine, or undefined if it doesn't exist.
   */
  override async getMLEngine(name: string): Promise<MLEngine | undefined> {
    const showMLEnginesQuery = `SHOW ML_ENGINES`;
    const sqlQueryResponse = await this.sqlClient.runQuery(showMLEnginesQuery);
    const mlEngineRow = sqlQueryResponse.rows.find((r) => r['name'] === name);
    if (!mlEngineRow) {
      return undefined;
    }
    return new MLEngine(
      this,
      mlEngineRow['name'],
      mlEngineRow['handler'],
      this.parseJson(mlEngineRow['connection_data'] as string)
    );
  }

  private parseJson(json?: string): any {
    if (!json) {
      return undefined;
    }
    return JSON.parse(
      json
        ?.replace(/'/g, '"')
        .replace(/"([^"]+)":\s*"/g, '"$1":"')
        .replace(/:\s*"(.*?)"/g, function (match, p1) {
          return ': "' + p1.replace(/"/g, '\\"') + '"';
        })
    );
  }

  /**
   * Deletes a mlEngine by name.
   * @param {string} name - Name of the mlEngine to be deleted.
   * @throws {MindsDbError} - Something went wrong deleting the mlEngine.
   */
  override async deleteMLEngine(name: string): Promise<void> {
    const dropMLEngineQuery = `DROP ML_ENGINE ${mysql.escapeId(name)}`;
    const sqlQueryResult = await this.sqlClient.runQuery(dropMLEngineQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }
}
