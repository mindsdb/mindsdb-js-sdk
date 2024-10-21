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
    const endClause = `START ${end_at}`;
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
