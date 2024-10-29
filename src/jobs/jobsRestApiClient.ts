import { Axios } from 'axios';
import JobsApiClient from './jobsApiClient';
import mysql from 'mysql';
import Job from './job';
import SqlApiClient from '../sql/sqlApiClient';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';

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
     * Retrieves a list of jobs from the information schema.
     *
     * This asynchronous method queries the database for jobs, optionally filtering
     * by project name and/or job name. If both parameters are provided, the method
     * combines the filters to return a more specific list of jobs.
     *
     * @param {string} [name] - The optional name of the job to filter the results. 
     *                           If provided, only jobs matching this name will be included.
     * @param {string} [project] - The optional project name to filter the results. 
     *                              If provided, only jobs associated with this project will be included.
     *
     * @returns {Promise<Array<Job>>} - A promise that resolves to an array of Job objects 
     *                                   representing the jobs retrieved from the database.
     * 
     * @throws {MindsDbError} - Throws an error if the SQL query execution fails, 
     *                          containing the error message returned from the database.
     *
     * @example
     * const jobs = await list('myJob', 'myProject');
     * console.log(jobs);
 */
  override async list(name?: string, project?: string): Promise<Array<Job>> {
    const selectClause = `SELECT * FROM information_schema.jobs`;
    let projectClause = '';
    let nameClause = '';
    if(project){
        projectClause = `WHERE project = ${mysql.escape(project)}`;
    }

    if(name){
        nameClause = `name = ${mysql.escape(name)}`;
    }

    const listJobsQuery = [selectClause, projectClause, nameClause].join(
        '\n'
    );

    const sqlQueryResult = await this.sqlClient.runQuery(listJobsQuery);
    if (sqlQueryResult.error_message) {
        throw new MindsDbError(sqlQueryResult.error_message);
    }
    return sqlQueryResult.rows.map(
        (r) => new Job(r['NAME'], r['QUERY'], r['IF_QUERY'], r['START_AT'], r['END_AT'], r['SCHEDULE_STR'])
      );

  }

}