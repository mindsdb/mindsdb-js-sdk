/** Structure of options to use when making a single prediction. */
interface QueryOptions {
  /** A single WHERE condition, or array of WHERE conditions to predict against.
   *  Example: 'field1 = val1' or ['field1 = val1', 'field2 = val2'].
   *
   * When using batch predictions, joins against source data that only meets WHERE conditions.
   * For batch predictions, make sure to use the 't' alias ('t' is short for training/test data).
   * Example: ['t.field1 = val1', 't.field2 = val2'] joins against source data where field1 = val1 and field2 = val2.
   */
  where?: string | Array<string>;
}

/** Structure of options to use when making a batch prediction. */
interface BatchQueryOptions extends QueryOptions {
  /** Data source to join against (e.g. example_db.demo_data.home_rentals). */
  join: string;

  /** Maximum number of predictions returned. */
  limit?: number;
}

export { BatchQueryOptions, QueryOptions };
