import Job from './job';

/** Abstract class outlining Jobs operations supported by the SDK. */
export default abstract class JobsApiClient {
  
  abstract list(name?: string, project?: string): Promise<Array<Job>>;
}