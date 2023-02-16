import mysql from 'mysql';
import { MindsDbError } from '../errors';

import SqlApiClient from '../sql/sqlApiClient';
import View from './view';
import ViewsApiClient from './viewsApiClient';

/** Implementation of ViewsApiClient that goes through the REST API */
export default class ViewsRestApiClient extends ViewsApiClient {
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
   * Gets all views for the given project.
   * @param {string} project - Project name to get all views from.
   * @returns {Promise<Array<View>>} - All views for the given project name.
   */
  override async getAllViews(project: string): Promise<Array<View>> {
    const showTablesQuery = `SHOW FULL TABLES FROM ${mysql.escapeId(project)}`;
    const sqlQueryResult = await this.sqlClient.runQuery(showTablesQuery);
    const viewRows = sqlQueryResult.rows.filter(
      (r) => r['table_type'] === 'VIEW'
    );
    return viewRows.map(
      (v) => new View(this, v[`tables_in_${project.toLowerCase()}`], project)
    );
  }

  /**
   * Creates a view using the given select statement
   * @param {string} name - Name of the view to create.
   * @param {string} project - Project the view will be created in.
   * @param {string} select - SELECT statement to use for initializing the view.
   * @returns {Promise<View>} - Newly created view.
   * @throws {MindsDbError} - Something went wrong while creating the view.
   */
  override async createView(
    name: string,
    project: string,
    select: string
  ): Promise<View> {
    const createViewQuery = `CREATE VIEW ${mysql.escapeId(
      project
    )}.${mysql.escapeId(name)} AS (${select})`;
    const sqlQueryResult = await this.sqlClient.runQuery(createViewQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return new View(this, name, project);
  }

  /**
   * Deletes a view from the project it belongs to.
   * @param {string} name - Name of the view to delete.
   * @param {string} project - Project the view belongs to.
   * @throws {MindsDbError} - Something went wrong while deleting the view.
   */
  override async deleteView(name: string, project: string): Promise<void> {
    // We use DROP MODEL instead of DROP TABLE since we can scope DROP MODEL by project.
    const dropModelQuery = `DROP MODEL ${mysql.escapeId(
      project
    )}.${mysql.escapeId(name)}`;
    const sqlQueryResult = await this.sqlClient.runQuery(dropModelQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }
}
