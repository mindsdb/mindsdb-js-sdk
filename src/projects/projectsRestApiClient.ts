import { Axios } from 'axios';
import ProjectsApiClient from './projectsApiClient';
import { getBaseRequestConfig } from '../util/http';
import Constants from '../constants';
import Project from './project';

/** Implementation of ProjectsApiClient that goes through the REST API. */
export default class ProjectsRestApiClient extends ProjectsApiClient {
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /** Session used for authentication. Used only for Cloud host. */
  session: string | undefined;

  /**
   * Constructor for Projects API client.
   * @param {Axios} client - Axios instance to send all HTTP requests.
   */
  constructor(client: Axios) {
    super();
    this.client = client;
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
   */
  override async getAllProjects(): Promise<Array<Project>> {
    const projectsResponse = await this.client.get(
      this.getProjectsUrl(),
      getBaseRequestConfig(this.session)
    );
    if (!projectsResponse.data) {
      return [];
    }
    return projectsResponse.data;
  }
}
