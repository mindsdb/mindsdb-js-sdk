import Job from './job';

/** Abstract class outlining Jobs operations supported by the SDK. */
export default abstract class JobsApiClient {
  /**
   * Abstract method for removing a new job in a specified project.
   * @returns {Promise<void>}
   */
  abstract deleteJob(name: string, project: string): Promise<void>;

  /**
   * Abstract method for creating a new job in a specified project.
   *
   * This method should be implemented by subclasses to construct and
   * execute a SQL query for creating a job with the given parameters.
   * The job will be defined to run according to the specified schedule 
   * and conditions. Implementations should ensure that the job is 
   * created only if it does not already exist.
   *
   * @param project - The name of the project where the job will be created.
   * @param name - The name of the job to be created.
   * @param query - The SQL query that the job will execute.
   * @param if_query - A condition that determines whether the job should run.
   * @param start_at - The timestamp at which the job should start.
   * @param end_at - The timestamp at which the job should end.
   * @param schedule_str - A string representing the schedule for job execution.
   *
   * @returns A promise that resolves to a new Job instance upon successful creation.
   * @throws MindsDbError if there is an error during the creation process.
   */
  abstract createJob(
    project: string,
    name: string,
    query: string,
    if_query: string,
    start_at: string,
    end_at: string,
    schedule_str: string
  ): Promise<Job>;
}
