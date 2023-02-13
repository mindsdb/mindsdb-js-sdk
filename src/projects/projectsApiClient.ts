import Project from './project';

/** Abstract class outlining Project operations supported by the SDK. */
export default abstract class ProjectsApiClient {
  /**
   * Gets all MindsDB projects for the current user.
   * @returns {Promise<Array<Project>>} - All projects.
   */
  abstract getAllProjects(): Promise<Array<Project>>;
}
