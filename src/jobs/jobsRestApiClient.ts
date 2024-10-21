import { Axios } from 'axios';
import JobsApiClient from './jobsApiClient';
import mysql from 'mysql';
import SqlApiClient from '../sql/sqlApiClient';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';
import Job from './job';

/** Implementation of JobsApiClient that goes through the REST API. */
export default class JobsRestApiClient extends JobsApiClient {
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /** Authenticator to use for reauthenticating if needed. */
  authenticator: HttpAuthenticator;

  /** SQL API client to send all SQL query requests. */
  sqlClient: SqlApiClient;

  /**
   * Constructor for Jobs API client.
   * @param {Axios} client - Axios instance to send all HTTP requests.
   */
  constructor(client: Axios, authenticator: HttpAuthenticator, sqlClient: SqlApiClient) {
    super();
    this.client = client;
    this.authenticator = authenticator;
    this.sqlClient = sqlClient;
  }

  /**
   * Delete a job
   * @returns {Promise<Array<Project>>} - Drop a job
   * @throws {MindsDbError} - Something went wrong fetching projects.
   */
  override async deleteJob(name: string, project: string): Promise<void> {
    const deleteQuery = `DROP JOB ${mysql.escapeId(project)}.${mysql.escapeId(
      name
    )}`;
    const sqlQueryResult = await this.sqlClient.runQuery(deleteQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  /**
   * Creates a new job in the specified project.
   *
   * This method constructs and executes a SQL query to create a job
   * with the provided parameters. If the job already exists, it will 
   * not be created again. The job will be scheduled to run based on 
   * the specified timing and conditions.
   *
   * @param project - The name of the project where the job will be created.
   * @param name - The name of the job to be created.
   * @param query - The SQL query to be executed by the job.
   * @param if_query - A condition that determines whether the job should run.
   * @param start_at - The time at which the job should start.
   * @param end_at - The time at which the job should end.
   * @param schedule_str - The schedule for how often the job should run.
   *
   * @returns A promise that resolves to a new Job instance if successful.
   * @throws MindsDbError if there is an error executing the SQL query.
   */
  override async createJob(
    project: string,
    name: string,
    query: string,
    if_query: string,
    start_at: string,
    end_at: string,
    schedule_str: string
  ): Promise<Job> {
    const createClause = `CREATE JOB IF NOT EXISTS ${mysql.escapeId(
      project
    )}.${mysql.escapeId(name)} AS `;

    const queryClause = `(${query})`;
    const startClause = `START ${start_at}`;
    const endClause = `END ${end_at}`;
    const everyClause = `EVERY ${schedule_str}`;
    const ifQueryClause = `IF (${if_query});`

    const sqlQuery = [createClause, queryClause, startClause, endClause, everyClause, ifQueryClause].join('\n');

    const sqlQueryResult = await this.sqlClient.runQuery(sqlQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return new Job(name, query, if_query, start_at, end_at, schedule_str);
  }
}
