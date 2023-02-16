import { JsonValue } from '../util/json';
import Database from './database';

/**
 * Abstract class outlining Database API operations supported by the SDK.
 */
export default abstract class DatabasesApiClient {
  /**
   * Gets all databases for the authenticated user.
   * @returns {Promise<Array<Database>>} - All databases for the user.
   */
  abstract getAllDatabases(): Promise<Array<Database>>;

  /**
   * Gets a database by name for the authenticated user.
   * @param {string} name - Name of the database.
   * @returns {Promise<Database | undefined>} - Matching database, or undefined if it doesn't exist.
   */
  abstract getDatabase(name: string): Promise<Database | undefined>;

  /**
   * Creates a database with the given name, engine, and parameters.
   * @param {string} name - Name of the database to be created.
   * @param {string} [engine] - Optional name of the database engine.
   * @param {string} [params] - Optional parameters used to connect to the database (e.g. user, password).
   * @returns {Promise<Database>} - Newly created database.
   * @throws {MindsDbError} - Something went wrong creating the database.
   */
  abstract createDatabase(
    name: string,
    engine?: string,
    params?: Record<string, JsonValue>
  ): Promise<Database>;

  /**
   * Deletes a database by name.
   * @param {string} name - Name of the database to be deleted.
   * @throws {MindsDbError} - Something went wrong deleting the database.
   */
  abstract deleteDatabase(name: string): Promise<void>;
}
