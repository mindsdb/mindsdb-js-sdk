import Job from './job';

/** Abstract class outlining Project operations supported by the SDK. */
export default abstract class JobsApiClient {
  /**
   * Removes a job for the current project
   * @returns {Promise<void>}
   */
  abstract deleteJob(name: string, project: string): Promise<void>;
}
