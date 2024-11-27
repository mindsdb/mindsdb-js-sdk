import ProjectsApiClient from './projectsApiClient';

/**
 * Represents a MindsDB project and all supported operation related to project.
 */
export default class Project {
  /** API client to use for executing project operations. */
  projectApiClient: ProjectsApiClient;

  /** Name of the project. */
  name: string;

  /**
   *
   * @param {ProjectsApiClient} projectApiClient - API client to use for executing project operations.
   * @param {string} name - Name of the project.
   */
  constructor(projectApiClient: ProjectsApiClient, name: string) {
    this.projectApiClient = projectApiClient;
    this.name = name;
  }
}
