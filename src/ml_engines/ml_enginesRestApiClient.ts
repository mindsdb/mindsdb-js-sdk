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
   * Creates a mlEngine with the given name, engine, and parameters.
   * @param {string} name - Name of the MLEngine to be created.
   * @param {string} [codeFilePath] - Path to the code file ( path.join(__dirname, 'model.py'))
   * @param {string} [modulesFilePath] - Path to the modules file ( path.join(__dirname, 'requirements.txt'))
   * @returns {Promise<MLEngine>} - Newly created mlEngine.
   * @throws {MindsDbError} - Something went wrong creating the mlEngine.
   */
  override async createMLEngine(
    name: string, // This is the variable that will be used in the URL
    codeFilePath: string,
    modulesFilePath: string
  ): Promise<MLEngine | undefined> {
    // Create form data
    const formData = new FormData();

    // Append the 'source' part
    formData.append('source', name);

    // Append the 'code' file part
    if (fs.existsSync(codeFilePath)) {
      // File exists, proceed with your operation
      formData.append('code', fs.createReadStream(codeFilePath), {
        filename: path.basename(codeFilePath), // The actual name of the file being read
        contentType: 'text/x-python-script',
      });
    } else {
      console.error('File does not exist:', codeFilePath);
    }

    // Append the 'modules' file part
    if (fs.existsSync(modulesFilePath)) {
      // File exists, proceed with your operation
      formData.append('modules', fs.createReadStream(modulesFilePath), {
        filename: path.basename(modulesFilePath), // The actual name of the file being read
        contentType: 'text/plain',
      });
    } else {
      console.error('File does not exist:', modulesFilePath);
    }

    // Axios request configuration
    const { authenticator, client } = this;

    const config = getBaseRequestConfig(authenticator);
    const mlEngineUrl = this.getMLEnginesUrl();
    config.method = 'put';
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
      (r) => new MLEngine(this, r['name'], r['handler'], r['connection_data'])
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
    const mlEngineRow = sqlQueryResponse.rows.find(
      (r) => r['name'] === name
    );
    if (!mlEngineRow) {
      return undefined;
    }
    return new MLEngine(
      this,
      mlEngineRow['name'],
      mlEngineRow['handler'],
      mlEngineRow['connection_data']
    );
  }

  // /**
  //  * Creates a mlEngine with the given name, engine, and parameters.
  //  * @param {string} name - Name of the mlEngine to be created.
  //  * @param {string} [engine] - Optional name of the mlEngine engine.
  //  * @param {string} [params] - Optional parameters used to connect to the mlEngine (e.g. user, password).
  //  * @returns {Promise<MLEngine>} - Newly created mlEngine.
  //  * @throws {MindsDbError} - Something went wrong creating the mlEngine.
  //  */
  // override async createMLEngine(
  //   name: string,
  //   engine?: string,
  //   params?: Record<string, JsonValue>
  // ): Promise<MLEngine> {
  //   // Can't use backtick quotes with CREATE DATABASE since it will be included
  //   // in the information schema, but we still want to escape the name.
  //   const escapedName = mysql.escapeId(name);
  //   const escapedNameNoBackticks = escapedName.slice(1, escapedName.length - 1);
  //   const createClause = `CREATE DATABASE ${escapedNameNoBackticks}`;
  //   let engineClause = '';
  //   let type = 'project';
  //   if (engine) {
  //     engineClause = `WITH ENGINE = ${mysql.escape(engine)}`;
  //     type = 'data';
  //   }
  //   let paramsClause = '';
  //   if (params) {
  //     engineClause += ',';
  //     paramsClause = `PARAMETERS = ${JSON.stringify(params)}`;
  //   }
  //   const createMLEngineQuery = [createClause, engineClause, paramsClause].join(
  //     '\n'
  //   );
  //   const sqlQueryResult = await this.sqlClient.runQuery(createMLEngineQuery);
  //   if (sqlQueryResult.error_message) {
  //     throw new MindsDbError(sqlQueryResult.error_message);
  //   }
  //   return new MLEngine(this, name, type, engine);
  // }

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
