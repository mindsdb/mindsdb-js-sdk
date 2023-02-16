import Table from './table';

/**
 * Abstract class outlining Table API operations supported by the SDK.
 */
export default abstract class TablesApiClient {
  /**
   * Creates a table in an integration from a given SELECT statement.
   * @param {string} name - Name of table to be created.
   * @param {string} integration - Name of integration the table will be a part of.
   * @param {string} select - SELECT statement to use for populating the new table with data.
   * @returns {Promise<Table>} - Newly created table.
   * @throws {MindsDbError} - Something went wrong creating the table.
   */
  abstract createTable(
    name: string,
    integration: string,
    select: string
  ): Promise<Table>;

  /**
   * Creates a table in an integration from a given SELECT statement. If the table already exists, it is
   * deleted first and then recreated.
   * @param {string} name - Name of table to be created/replaced.
   * @param {string} integration - Name of integration the table will be a part of.
   * @param {string} select - SELECT statement to use for populating the new/replaced table with data.
   * @returns {Promise<Table>} - Newly created/replaced table.
   * @throws {MindsDbError} - Something went wrong creating or replacing the table.
   */
  abstract createOrReplaceTable(
    name: string,
    integration: string,
    select: string
  ): Promise<Table>;

  /**
   * Deletes a table from its integration.
   * @param {string} name - Name of the table to be deleted.
   * @param {string} integration - Name of the integration the table to be deleted is a part of.
   * @throws {MindsDbError} - Something went wrong deleting the table.
   */
  abstract deleteTable(name: string, integration: string): Promise<void>;
}
