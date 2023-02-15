import ViewsApiClient from './viewsApiClient';

/**
 * Represents a MindsDB view and all supported operations.
 */
export default class View {
  /** API client to use for executing view operations. */
  viewsApiClient: ViewsApiClient;

  /** Name of the view. */
  name: string;

  /** Project the view belongs to. */
  project: string;

  /**
   *
   * @param {ViewsApiClient} viewsApiClient - API client to use for executing view operations.
   * @param {string} name - Name of the view.
   * @param {string} project - Project the view belongs to.
   */
  constructor(viewsApiClient: ViewsApiClient, name: string, project: string) {
    this.viewsApiClient = viewsApiClient;
    this.name = name;
    this.project = project;
  }

  /** Deletes this view from the project it belongs to.
   *  @throws {MindsDbError} - Something went wrong deleting this view.
   */
  async delete(): Promise<void> {
    await this.viewsApiClient.deleteView(this.name, this.project);
  }
}
