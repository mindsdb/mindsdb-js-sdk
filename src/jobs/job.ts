export default class Job {
    
    name: string;
    query: string;
    if_query: string;
    start_at: string;
    end_at: string;
    schedule_str: string;

    constructor(
        name: string,
        query: string,
        if_query: string,
        start_at: string,
        end_at: string,
        schedule_str: string
    ) {
        this.name = name;
        this.query = query;
        this.if_query = if_query;
        this.start_at = start_at;
        this.end_at = end_at;
        this.schedule_str = schedule_str;
    }
}