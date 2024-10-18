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
   * Deletes this table from its integration.
   * @throws {MindsDbError} - Something went wrong deleting this table.
   */
  async delete(): Promise<void> {
    await this.tablesApiClient.deleteTable(this.name, this.integration);
  }

    /**
   * Updates this table with new data.
   * @param {string} setClause - The SET clause for updating the table (e.g., 'column1 = value1, column2 = value2').
   * @param {string} whereClause - The WHERE clause to specify which rows to update.
   * @returns {Promise<Table>} - The updated table.
   * @throws {MindsDbError} - Something went wrong updating this table.
   */
    async update(setClause: string, whereClause: string): Promise<Table> {
      return await this.tablesApiClient.updateTable(
        this.name,
        this.integration,
        setClause,
        whereClause
      );
    }
}
