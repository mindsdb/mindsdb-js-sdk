import Project from './project';

/** Abstract class outlining Project operations supported by the SDK. */
export default abstract class ProjectsApiClient {
  /**
   * Gets all MindsDB projects for the current user.
   * @returns {Promise<Array<Project>>} - All projects.
   */
  abstract getAllProjects(): Promise<Array<Project>>;

  /**
   * Creates a new MindsDB project.
   * @param {string} name - Name of the project.
   * @returns {Promise<Project>} - The created project.
   */
  abstract createProject(name: string): Promise<Project>;
  abstract deleteProject(name: string): Promise<void>;
}
