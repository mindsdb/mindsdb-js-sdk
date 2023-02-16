import View from './view';

/**
 * Abstract class outlining View API operations supported by the SDK.
 */
export default abstract class ViewsApiClient {
  /**
   * Gets all views for the given project.
   * @param {string} project - Project name to get all views from.
   * @returns {Promise<Array<View>>} - All views for the given project name.
   */
  abstract getAllViews(project: string): Promise<Array<View>>;

  /**
   * Creates a view using the given select statement
   * @param {string} name - Name of the view to create.
   * @param {string} project - Project the view will be created in.
   * @param {string} select - SELECT statement to use for initializing the view.
   * @returns {Promise<View>} - Newly created view.
   * @throws {MindsDbError} - Something went wrong while creating the view.
   */
  abstract createView(
    name: string,
    project: string,
    select: string
  ): Promise<View>;

  /**
   * Deletes a view from the project it belongs to.
   * @param {string} name - Name of the view to delete.
   * @param {string} project - Project the view belongs to.
   * @throws {MindsDbError} - Something went wrong while deleting the view.
   */
  abstract deleteView(name: string, project: string): Promise<void>;
}
