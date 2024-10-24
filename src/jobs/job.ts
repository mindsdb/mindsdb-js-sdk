import JobsApiClient from './jobsApiClient';
import { MindsDbError } from '../errors';

/**
 * Represents a MindsDB job and provides methods to build and create it.
 */
export default class Job {
  /** API client to use for executing job operations. */
  private jobsApiClient: JobsApiClient;

  /** Name of the job. */
  name: string;

  /** Project the job belongs to. */
  project: string;

  /** Accumulated queries to be executed by the job. */
  private queries: string[];

  /** Optional start date for the job. */
  private start?: string;

  /** Optional end date for the job. */
  private end?: string;

  /** Optional repetition frequency. */
  private every?: string;

  /** Optional condition for job execution. */
  private ifCondition?: string;

  /**
   * @param {JobsApiClient} jobsApiClient - API client to use for executing job operations.
   * @param {string} name - Name of the job.
   * @param {string} project - Project the job belongs to.
   */
  constructor(jobsApiClient: JobsApiClient, name: string, project: string) {
    this.jobsApiClient = jobsApiClient;
    this.name = name;
    this.project = project;
    this.queries = [];
  }

  /**
   * Adds a query to the job.
   * @param {string} query - The query to add.
   * @returns {Job} - The current job instance (for chaining).
   * @throws {MindsDbError} - If the query is invalid.
   */
  addQuery(query: string): Job {
    if (typeof query === 'string') {
      this.queries.push(query);
    } else {
      throw new MindsDbError('Invalid query type. Must be a string.');
    }
    return this;
  }

  /**
   * Sets the start date for the job.
   * @param {string} start - The start date as a string.
   * @returns {Job} - The current job instance (for chaining).
   */
  setStart(start: string): Job {
    this.start = start;
    return this;
  }

  /**
   * Sets the end date for the job.
   * @param {string} end - The end date as a string.
   * @returns {Job} - The current job instance (for chaining).
   */
  setEnd(end: string): Job {
    this.end = end;
    return this;
  }

  /**
   * Sets the repetition frequency for the job.
   * @param {string} every - The repetition frequency.
   * @returns {Job} - The current job instance (for chaining).
   */
  setEvery(every: string): Job {
    this.every = every;
    return this;
  }

  /**
   * Sets the condition for job execution.
   * @param {string} ifCondition - The condition as a string.
   * @returns {Job} - The current job instance (for chaining).
   */
  setIfCondition(ifCondition: string): Job {
    this.ifCondition = ifCondition;
    return this;
  }

  /**
   * Creates the job in MindsDB.
   * @returns {Promise<void>} - Resolves when the job is created.
   * @throws {MindsDbError} - If job creation fails.
   */
  async create(): Promise<void> {
    if (this.queries.length === 0) {
      throw new MindsDbError('No queries added to the job.');
    }
    const queryStr = this.queries.join(';\n');
    await this.jobsApiClient.createJob(
      this.name,
      this.project,
      queryStr,
      this.start,
      this.end,
      this.every,
      this.ifCondition
    );
  }
}
