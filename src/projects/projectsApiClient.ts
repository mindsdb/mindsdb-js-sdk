import Project from './project';

/** Abstract class outlining Project operations supported by the SDK. */
export default abstract class ProjectsApiClient {
  /**
   * Gets all MindsDB projects.
   * 
   * @returns {Promise<Array<Project>>} - All projects.
   */
  abstract getAllProjects(): Promise<Array<Project>>;

  /**
   * Gets a MindsDB project by name.
   * 
   * @param {string} name - Name of the project to get.
   */
  abstract getProject(name: string): Promise<Project>;

  /**
   * Creates a new MindsDB project.
   * 
   * @param {string} name - Name of the project to create.
   * @returns {Promise<Project>} - The created project.
   */
  abstract createProject(name: string): Promise<Project>;

  /**
   * Delete a MindsDB project by name.
   *
   * @param {string} name - Name of the project to delete.
   */
  abstract deleteProject(name: string): Promise<void>;
}
