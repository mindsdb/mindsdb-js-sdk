import Job from './job';

/** Abstract class outlining Jobs operations supported by the SDK. */
export default abstract class JobsApiClient {
  /**
   * Removes a job for the current project
   * @returns {Promise<void>}
   */
  abstract deleteJob(name: string, project: string): Promise<void>;

  /**
   * Creates a job in an integration from a given SELECT statement.
   * @param {string} name - Name of table to be created.
   * @param {string} integration - Name of integration the table will be a part of.
   * @param {string} select - SELECT statement to use for populating the new table with data.
   * @returns {Promise<Table>} - Newly created table.
   * @throws {MindsDbError} - Something went wrong creating the table.
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
