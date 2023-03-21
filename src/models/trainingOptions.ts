import { JsonValue } from '../util/json';

/** Structure of options to use when adjusting a model.  */
interface AdjustOptions {
  /** Integration name for the training data (e.g. mindsdb). */
  integration: string;
  /** SELECT SQL statement to use for selecting data. */
  select: string;

  /** Model and training parameters to set during adjustment. */
  using?: Record<string, JsonValue>;
}

/** Structure of options to use when training a model. */
interface TrainingOptions {
  /** Integration name for the training data (e.g. mindsdb). */
  integration?: string;
  /** SELECT SQL statement to use for selecting data. */
  select?: string;

  /** Column name to group by (for time series data only). */
  groupBy?: string;

  /** Column name to order by (for time series data only). */
  orderBy?: string;

  /** How many rows in the past to use when making a future prediction (for time series data only). */
  window?: number;

  /** How many rows in the future to forecast (for time series data only). */
  horizon?: number;

  /** Model and training parameters to set during training. */
  using?: Record<string, JsonValue>;
}

export { AdjustOptions, TrainingOptions };
