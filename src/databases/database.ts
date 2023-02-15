import DatabasesApiClient from './databasesApiClient';

/**
 * Represents a MindsDB database and all supported operations.
 */
export default class Database {
  /** API client to use for executing database operations. */
  databasesApiClient: DatabasesApiClient;

  /** Name of the database. */
  name: string;

  /** Type of the database (e.g. project, data). */
  type: string;

  /** Engine used to create the database (e.g. postgres). */
  engine: string | undefined;

  /**
   *
   * @param {DatabasesApiClient} databasesApiClient - API client to use for executing database operations.
   * @param {string} name - Name of the database.
   * @param {string} type - Type of the database (e.g. project, data).
   * @param {string} engine - Engine used to create the database (e.g. postgres).
   */
  constructor(
    databasesApiClient: DatabasesApiClient,
    name: string,
    type: string,
    engine: string | undefined
  ) {
    this.databasesApiClient = databasesApiClient;
    this.name = name;
    this.type = type;
    this.engine = engine;
  }

  /** Deletes this database.
   *  @throws {MindsDbError} - Something went wrong deleting the database.
   */
  async delete(): Promise<void> {
    await this.databasesApiClient.deleteDatabase(this.name);
  }
}
