import mysql from 'mysql';

import SqlApiClient from '../sql/sqlApiClient';
import { JsonValue } from '../util/json';
import { MindsDbError } from '../errors';
import Database from './database';
import DatabasesApiClient from './databasesApiClient';

/** Implementation of DatabasesApiClient that goes through the REST API. */
export default class DatabasesRestApiClient extends DatabasesApiClient {
  /** SQL API client to send all SQL query requests. */
  sqlClient: SqlApiClient;

  /**
   *
   * @param {SqlApiClient} sqlClient - SQL API client to send all SQL query requests.
   */
  constructor(sqlClient: SqlApiClient) {
    super();
    this.sqlClient = sqlClient;
  }

  /**
   * Gets all databases for the authenticated user.
   * @returns {Promise<Array<Database>>} - All databases for the user.
   */
  override async getAllDatabases(): Promise<Array<Database>> {
    const showDatabasesQuery = `SHOW FULL DATABASES`;
    const sqlQueryResponse = await this.sqlClient.runQuery(showDatabasesQuery);
    return sqlQueryResponse.rows.map(
      (r) => new Database(this, r['database'], r['type'], r['engine'])
    );
  }

  /**
   * Gets a database by name for the authenticated user.
   * @param {string} name - Name of the database.
   * @returns {Promise<Database | undefined>} - Matching database, or undefined if it doesn't exist.
   */
  override async getDatabase(name: string): Promise<Database | undefined> {
    const showDatabasesQuery = `SHOW FULL DATABASES`;
    const sqlQueryResponse = await this.sqlClient.runQuery(showDatabasesQuery);
    const databaseRow = sqlQueryResponse.rows.find(
      (r) => r['database'] === name
    );
    if (!databaseRow) {
      return undefined;
    }
    return new Database(
      this,
      databaseRow['database'],
      databaseRow['type'],
      databaseRow['engine']
    );
  }

  /**
   * Creates a database with the given name, engine, and parameters.
   * @param {string} name - Name of the database to be created.
   * @param {string} [engine] - Optional name of the database engine.
   * @param {string} [params] - Optional parameters used to connect to the database (e.g. user, password).
   * @returns {Promise<Database>} - Newly created database.
   * @throws {MindsDbError} - Something went wrong creating the database.
   */
  override async createDatabase(
    name: string,
    engine?: string,
    params?: Record<string, JsonValue>
  ): Promise<Database> {
    // Can't use backtick quotes with CREATE DATABASE since it will be included
    // in the information schema, but we still want to escape the name.
    const escapedName = mysql.escapeId(name);
    const escapedNameNoBackticks = escapedName.slice(1, escapedName.length - 1);
    const createClause = `CREATE DATABASE ${escapedNameNoBackticks}`;
    let engineClause = '';
    let type = 'project';
    if (engine) {
      engineClause = `WITH ENGINE = ${mysql.escape(engine)}`;
      type = 'data';
    }
    let paramsClause = '';
    if (params) {
      engineClause += ',';
      paramsClause = `PARAMETERS = ${JSON.stringify(params)}`;
    }
    const createDatabaseQuery = [createClause, engineClause, paramsClause].join(
      '\n'
    );
    const sqlQueryResult = await this.sqlClient.runQuery(createDatabaseQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return new Database(this, name, type, engine);
  }

  /**
   * Deletes a database by name.
   * @param {string} name - Name of the database to be deleted.
   * @throws {MindsDbError} - Something went wrong deleting the database.
   */
  override async deleteDatabase(name: string): Promise<void> {
    const dropDatabaseQuery = `DROP DATABASE ${mysql.escapeId(name)}`;
    const sqlQueryResult = await this.sqlClient.runQuery(dropDatabaseQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }
}
