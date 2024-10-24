import Job from './job';

/**
 * Abstract class outlining Job API operations supported by the SDK.
 */
export default abstract class JobsApiClient {
  /**
   * Creates a new Job instance for building and creating a job.
   * @param {string} name - Name of the job.
   * @param {string} project - Project the job belongs to.
   * @returns {Job} - A new Job instance.
   */
  abstract create(name: string, project: string): Job;

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
  abstract createJob(
    name: string,
    project: string,
    query: string,
    start?: string,
    end?: string,
    every?: string,
    ifCondition?: string
  ): Promise<void>;
}
