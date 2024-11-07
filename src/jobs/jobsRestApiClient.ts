import mysql from 'mysql';
import { MindsDbError } from '../errors';

import SqlApiClient from '../sql/sqlApiClient';
import Job from './job';
import JobsApiClient from './jobsApiClient';

export default class JobsRestApiClient extends JobsApiClient {
  sqlClient: SqlApiClient;

  /**
   * @param {SqlApiClient} sqlClient - SQL API client to send all SQL query requests.
   */
  constructor(sqlClient: SqlApiClient) {
    super();
    this.sqlClient = sqlClient;
  }

  /**
   * Creates a new Job instance for building and creating a job.
   * @param {string} name - Name of the job.
   * @param {string} project - Project the job belongs to.
   * @returns {Job} - A new Job instance.
   */
  override create(name: string, project: string = "mindsdb"): Job {
    return new Job(this, name, project);
  }

  /**
   * Internal method to create the job in MindsDB.
   * @param {string} name - Name of the job to create.
   * @param {string} project - Project the job will be created in.
   * @param {string} query - Queries to be executed by the job.
   * @param {string} [start] - Optional start date for the job.
   * @param {string} [end] - Optional end date for the job.
   * @param {string} [every] - Optional repetition frequency.
   * @param {string} [ifCondition] - Optional condition for job execution.
   * @returns {Promise<void>} - Resolves when the job is created.
   * @throws {MindsDbError} - Something went wrong while creating the job.
   */
  override async createJob(
    name: string,
    project: string,
    query: string,
    start?: string,
    end?: string,
    every?: string,
    ifCondition?: string
  ): Promise<void> {
    let createJobQuery = `CREATE JOB ${mysql.escapeId(project)}.${mysql.escapeId(name)} (\n${query}\n)`;

    if (start) {
      createJobQuery += `\nSTART '${start}'`;
    }
    if (end) {
      createJobQuery += `\nEND '${end}'`;
    }
    if (every) {
      createJobQuery += `\nEVERY ${every}`;
    }
    if (ifCondition) {
      createJobQuery += `\nIF (\n${ifCondition}\n)`;
    }

    const sqlQueryResult = await this.sqlClient.runQuery(createJobQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  /**
   * Internal method to delete the job in MindsDB.
   * @param {string} name - Name of the job to delete.
   * @param {string} project - Project the job belongs to.
   * @returns {Promise<void>} - Resolves when the job is deleted.
   * @throws {MindsDbError} - Something went wrong while deleting the job.
   */
  override async deleteJob(
    name: string,
    project: string
  ): Promise<void> {
    const dropJobQuery = `DROP JOB ${mysql.escapeId(project)}.${mysql.escapeId(name)};`;

    const sqlQueryResult = await this.sqlClient.runQuery(dropJobQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  /**
   * Internal method to deleting the job in MindsDB with users providing a name
   * @param {string} name - Name of the job to delete.
   * @param {string} project - Project the job belongs to.
   * @returns {Promise<void>} - Resolves when the job is deleted.
   * @throws {MindsDbError} - Something went wrong while deleting the job.
   */
  override async dropJob(
    name: string,
    project: string = "mindsdb"
  ): Promise<void> {
    const dropJobQuery = `DROP JOB ${mysql.escapeId(project)}.${mysql.escapeId(name)};`;

    const sqlQueryResult = await this.sqlClient.runQuery(dropJobQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }
}
