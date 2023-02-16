import axios from 'axios';

import ModelsModule from './models/modelsModule';
import DatabasesModule from './databases/databasesModule';
import ProjectsModule from './projects/projectsModule';
import SQLModule from './sql/sqlModule';
import ViewsModule from './views/viewsModule';
import ConnectionOptions from './connectionOptions';
import Constants from './constants';
import {
  createDefaultAxiosInstance,
  getCookieValue,
  isMindsDbCloudEndpoint,
} from './util/http';
import TablesModule from './tables/tablesModule';

const defaultAxiosInstance = createDefaultAxiosInstance();

const SQL = new SQLModule.SqlRestApiClient(defaultAxiosInstance);
const Databases = new DatabasesModule.DatabasesRestApiClient(SQL);
const Models = new ModelsModule.ModelsRestApiClient(SQL);
const Projects = new ProjectsModule.ProjectsRestApiClient(defaultAxiosInstance);
const Tables = new TablesModule.TablesRestApiClient(SQL);
const Views = new ViewsModule.ViewsRestApiClient(SQL);

/**
 * Initializes the MindsDB SDK and authenticates the user if needed.
 * @param {ConnectionOptions} options - Options to use for initialization
 */
const connect = async function (options: ConnectionOptions): Promise<void> {
  const httpClient = options.httpClient || defaultAxiosInstance;
  SQL.client = httpClient;
  Projects.client = httpClient;
  const baseURL =
    httpClient.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
  // Need to authenticate if we're using the Cloud API endpoints.
  if (isMindsDbCloudEndpoint(baseURL)) {
    const loginURL = new URL(Constants.BASE_LOGIN_URI, baseURL);
    const loginResponse = await httpClient.post(loginURL.href, {
      email: options.user,
      password: options.password,
    });

    const session = getCookieValue(
      loginResponse.headers['set-cookie'] || [],
      'session'
    );
    SQL.session = session;
    Projects.session = session;
  }
};

export default { connect, SQL, Databases, Models, Projects, Tables, Views };
