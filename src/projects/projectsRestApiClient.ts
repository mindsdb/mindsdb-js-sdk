import { Axios } from 'axios';
import ProjectsApiClient from './projectsApiClient';
import { getBaseRequestConfig } from '../util/http';
import Constants from '../constants';
import Project from './project';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';
import SqlApiClient from '../sql/sqlApiClient';

/** Implementation of ProjectsApiClient that goes through the REST API. */
export default class ProjectsRestApiClient extends ProjectsApiClient {
  /** SQL API client to send all SQL query requests. */
  sqlClient: SqlApiClient;

  /** Axios client to send all HTTP requests. */
  client: Axios;

  /** Authenticator to use for reauthenticate if needed. */
  authenticator: HttpAuthenticator;

  /**
   * Constructor for Projects API client.
   * @param {Axios} client - Axios instance to send all HTTP requests.
   */
  constructor(
    sqlClient: SqlApiClient,
    client: Axios,
    authenticator: HttpAuthenticator
  ) {
    super();
    this.sqlClient = sqlClient;
    this.client = client;
    this.authenticator = authenticator;
  }

  private getProjectsUrl(): string {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const projectsUrl = new URL(Constants.BASE_PROJECTS_URI, baseUrl);
    return projectsUrl.toString();
  }

  /**
   * Gets all MindsDB projects for the current user.
   * @returns {Promise<Array<Project>>} - All projects.
   * @throws {MindsDbError} - Something went wrong fetching projects.
   */
  override async getAllProjects(): Promise<Array<Project>> {
    const projectsUrl = this.getProjectsUrl();
    const { authenticator, client } = this;
    try {
      const projectsResponse = await client.get(
        projectsUrl,
        getBaseRequestConfig(authenticator)
      );
      if (!projectsResponse.data) {
        return [];
      }
      return projectsResponse.data;
    } catch (error) {
      throw MindsDbError.fromHttpError(error, projectsUrl);
    }
  }

  /**
   *
   * @param name - Name of the project to create.
   * @returns {Promise<Project>} - The created project.
   */
  override async createProject(name: string): Promise<Project> {
    const sqlQuery = `CREATE PROJECT ${name}`;

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }

    return new Project(this, name);
  }

  /**
   *
   * @param {string} name - Name of the project to delete.
   */
  override async deleteProject(name: string): Promise<void> {
    const sqlQuery = `DROP PROJECT ${name}`;

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }
}
