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
  
  /** SELECT statement to use for initializing the view. */
  select:string;
  /**
   *
   * @param {ViewsApiClient} viewsApiClient - API client to use for executing view operations.
   * @param {string} name - Name of the view.
   * @param {string} project - Project the view belongs to.
   * @param {string} select - SELECT statement to use for initializing the view.
   */
  constructor(viewsApiClient: ViewsApiClient, name: string, project: string,select:string) {
    this.viewsApiClient = viewsApiClient;
    this.name = name;
    this.project = project;
    this.select=select;
  }

  /** Deletes this view from the project it belongs to.
   *  @throws {MindsDbError} - Something went wrong deleting this view.
   */
  async delete(): Promise<void> {
    await this.viewsApiClient.deleteView(this.name, this.project);
  }

  /** Creates a view for the given project
   *  @throws {MindsDbError} - Something went wrong creating this view.
   */
  async create():Promise<void>{
    await this.viewsApiClient.createView(this.name,this.project,this.select);
  }
}
