import { table } from 'console';
import TablesApiClient from './tablesApiClient';

/**
 * Represents a MindsDB table and all supported operations.
 */
export default class Table {
  /** API client to use for executing table operations. */
  tablesApiClient: TablesApiClient;

  /** Name of the table. */
  name: string;

  /** Integration the table is a part of (e.g. files, mindsdb). */
  integration: string;

  /**
   *
   * @param {TablesApiClient} tablesApiClient - API client to use for executing operations on this table.
   * @param {string} name  - Name of this table.
   * @param {string} integration - Integration the table is a part of.
   */
  constructor(
    tablesApiClient: TablesApiClient,
    name: string,
    integration: string
  ) {
    this.tablesApiClient = tablesApiClient;
    this.name = name;
    this.integration = integration;
  }
  /**
   * Removes this table from its integration.
   * @throws {MindsDbError} - Something went wrong removing this table.
   */
  async removeTable(): Promise<void> {
    await this.tablesApiClient.removeTable(this.name, this.integration);
  }
  /**
   * Creates a table in an integration from a given SELECT statement.
   * @param {string} select - SELECT statement to use for populating the new table with data.
   * @returns {Promise<Table>} - Newly created table.
   * @throws {MindsDbError} - Something went wrong creating the table.
   */
  async create(select: string): Promise<Table> {
    return await this.tablesApiClient.createTable(this.name, this.integration, select);
  }

  /**
   * Deletes this table from its integration.
   * @throws {MindsDbError} - Something went wrong deleting this table.
   */
  async delete(): Promise<void> {
    await this.tablesApiClient.deleteTable(this.name, this.integration);
  }

   /**

   * Updates a table from its integration.
   * @param {string} updateQuery - The SQL UPDATE query to run for updating the table.
   * @throws {MindsDbError} - Something went wrong deleting the table.
   */
   async  update(updateQuery: string): Promise<void> {
    await this.tablesApiClient.updateTable(this.name, this.integration,updateQuery);
   }
}

   * Insert data into this table.
   * @param {string} select - SELECT query to insert data from.
   * @throws {MindsDbError} - Something went wrong inserting data into the table.
   */
   async insert(select: string): Promise<void> {
    await this.tablesApiClient.insertTable(this.name, this.integration, select);
  }
}

