import { Axios } from 'axios';
import JobsApiClient from './jobsApiClient';
import { getBaseRequestConfig } from '../util/http';
import Constants from '../constants';
import Job from './job';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';

/** Implementation of ProjectsApiClient that goes through the REST API. */
export default class JobsRestApiClient extends JobsApiClient {
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

  private getJobsUrl(): string {
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
  override async deleteJob(): Promise<void> {
    const jobsDeleteUrl = this.getJobsUrl();
    const { authenticator, client } = this;
    try {
      const projectsResponse = await client.delete(
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
