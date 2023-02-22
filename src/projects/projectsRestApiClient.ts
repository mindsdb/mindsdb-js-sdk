import { Axios } from 'axios';
import ProjectsApiClient from './projectsApiClient';
import { getBaseRequestConfig } from '../util/http';
import Constants from '../constants';
import Project from './project';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';

/** Implementation of ProjectsApiClient that goes through the REST API. */
export default class ProjectsRestApiClient extends ProjectsApiClient {
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /** Authenticator to use for reauthenticating if needed. */
  authenticator: HttpAuthenticator;

  /**
   * Constructor for Projects API client.
   * @param {Axios} client - Axios instance to send all HTTP requests.
   */
  constructor(client: Axios, authenticator: HttpAuthenticator) {
    super();
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
}
