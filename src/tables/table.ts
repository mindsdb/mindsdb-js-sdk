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
}
