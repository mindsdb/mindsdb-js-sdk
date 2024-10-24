import JobApiClient from "./jobApiClient";

/**
 * Enables you to automate any pipeline to schedule any query at any frequency
 */
export default class Job {
    jobsApiClient: JobApiClient;

    project_name: string;

    name: string;

    data: string;

    constructor(jobApiClient: JobApiClient) {
        this.jobsApiClient = jobApiClient;
        this.project_name = "";
        this.name = "";
        this.data = "";
    }
}