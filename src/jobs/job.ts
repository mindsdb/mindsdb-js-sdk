/** Structure of a MindsDB Project. */
export default interface Job {
    /** Name of the Job. */
    name: string;
    query: string;
    if_query: string;
    start_at: string;
    end_at: string;
    schedule_str: string;
}
