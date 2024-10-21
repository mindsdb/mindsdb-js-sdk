import ModelsModule from './models/modelsModule';
import DatabasesModule from './databases/databasesModule';
import ProjectsModule from './projects/projectsModule';
import JobsModule from './jobs/jobsModule';
import SQLModule from './sql/sqlModule';
import ViewsModule from './views/viewsModule';
import Constants from './constants';
import {
  createDefaultAxiosInstance,
  isLocalEndpoint,
  isMindsDbCloudEndpoint,
  retryUnauthenticatedRequest,
} from './util/http';
import TablesModule from './tables/tablesModule';
import HttpAuthenticator from './httpAuthenticator';
import { Axios } from 'axios';

// For type declarations.
import ConnectionOptions from './connectionOptions';
import Database from './databases/database';
import {
  Model,
  ModelFeatureDescription,
  ModelPrediction,
} from './models/model';
import { MindsDbError } from './errors';
import { BatchQueryOptions, QueryOptions } from './models/queryOptions';
import { FinetuneOptions, TrainingOptions } from './models/trainingOptions';
import Project from './projects/project';
import Job from './jobs/job';
import SqlQueryResult from './sql/sqlQueryResult';
import Table from './tables/table';
import { JsonPrimitive, JsonValue } from './util/json';
import View from './views/view';
import MLEnginesModule from './ml_engines/ml_enginesModule';
import CallbacksModule from './callback/callbacksModule';
import { ILogger, Logger, LogLevel } from './util/logger';

const defaultAxiosInstance = createDefaultAxiosInstance();
const httpAuthenticator = new HttpAuthenticator();
const defaultLogger = new Logger(console, LogLevel.ERROR);

const SQL = new SQLModule.SqlRestApiClient(
  defaultAxiosInstance,
  httpAuthenticator,
  defaultLogger
);
const Databases = new DatabasesModule.DatabasesRestApiClient(SQL);
const Models = new ModelsModule.ModelsRestApiClient(SQL);
const Projects = new ProjectsModule.ProjectsRestApiClient(
  defaultAxiosInstance,
  httpAuthenticator
);
const Jobs = new JobsModule.JobsRestApiClient(
  SQL,
  defaultAxiosInstance,
  httpAuthenticator
);
const Tables = new TablesModule.TablesRestApiClient(SQL);
const Views = new ViewsModule.ViewsRestApiClient(SQL);
const MLEngines = new MLEnginesModule.MLEnginesRestApiClient(
  SQL,
  defaultAxiosInstance,
  httpAuthenticator
);
const Callbacks = new CallbacksModule.CallbacksRestApiClient(
  defaultAxiosInstance,
  httpAuthenticator
);

const getAxiosInstance = function (options: ConnectionOptions): Axios {
  const httpClient = options.httpClient || defaultAxiosInstance;
  httpClient.defaults.baseURL =
    options.host || Constants.BASE_CLOUD_API_ENDPOINT;
  // Retry failed requests with 401/403 status code once.
  httpClient.interceptors.response.use(
    (resp) => resp,
    async (error) =>
      retryUnauthenticatedRequest(error, httpClient, httpAuthenticator)
  );
  return httpClient;
};

/**
 * Initializes the MindsDB SDK and authenticates the user if needed.
 * @param {ConnectionOptions} options - Options to use for initialization.
 * @throws {MindsDbError} - MindsDB authentication request failed.
 */
const connect = async function (options: ConnectionOptions): Promise<void> {
  const httpClient = getAxiosInstance(options);
  SQL.client = httpClient;
  Projects.client = httpClient;
  Jobs.client = httpClient;
  MLEngines.client = httpClient;
  Callbacks.client = httpClient;

  if (options.logging) {
    const logger = new Logger(options.logging.logger, options.logging.logLevel);
    SQL.logger = logger;
  }

  const baseURL =
    httpClient.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
  // Need to authenticate if we're using the Cloud API endpoints.
  if (isMindsDbCloudEndpoint(baseURL) || !isLocalEndpoint(baseURL)) {
    try {
      await httpAuthenticator.authenticate(
        httpClient,
        options.user,
        options.password,
        options.managed
      );
    } catch (error) {
      throw MindsDbError.fromHttpError(error, baseURL);
    }
  }
};

export default {
  connect,
  SQL,
  Databases,
  Models,
  Projects,
  Jobs,
  Tables,
  Views,
  MLEngines,
  Callbacks,
};
export {
  ConnectionOptions,
  Database,
  Model,
  ModelFeatureDescription,
  ModelPrediction,
  MindsDbError,
  BatchQueryOptions,
  QueryOptions,
  FinetuneOptions,
  TrainingOptions,
  Project,
  Job,
  SqlQueryResult,
  Table,
  JsonPrimitive,
  JsonValue,
  View,
  ILogger,
  LogLevel,
};
