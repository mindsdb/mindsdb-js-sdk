import { JsonPrimitive } from '../util/json';
import ModelsApiClient from './modelsApiClient';
import { BatchQueryOptions, QueryOptions } from './queryOptions';
import { AdjustOptions, TrainingOptions } from './trainingOptions';

/** Status of a model being up to date or not. */
type UpdateStatus = 'available' | 'updating' | 'up_to_date';

/**
 * Structure of a row returned from the MindsDB model database via the SQL query API.
 */
interface ModelRow {
  /** Name of the model. */
  name: string;

  /** Name of the project the model belongs to. */
  project: string;

  /** Target column the model predicts. */
  predict: string;

  /** Training status of the model (e.g. training, error, complete). */
  status: string;

  /** Status of the model being up to date or not.
   *  Set to 'available' when a new version of MindsDB is available that makes the model obsolete, or
   *  when new data is available in the table that was used to train the model.
   */
  update_status: UpdateStatus;

  /**
   * Model version.
   */
  version: number;

  /** Accuracy of model predictions between 0 and 1. */
  accuracy?: number;

  /** User assigned model tag. */
  tag?: string;

  /** Whether the model is active or not. */
  active: boolean;
}

interface ModelFeatureDescription {
  /**
   * Column name of the feature.
   */
  column: string;

  /**
   * Data type of the feature.
   */
  type: string;

  /**
   * Encoder type used to encode the feature.
   */
  encoder: string;

  /**
   * Role of the feature (e.g. target, feature).
   */
  role: string;
}

/**
 * Structure of a prediction obtained from a model.
 */
interface ModelPrediction {
  /**
   * Predicted value of the target column.
   */
  value: JsonPrimitive;

  /**
   * Object containing metadata (if it exists) about the prediction.
   */
  explain?: object;

  /**
   * Raw data of the prediction returned from the MindsDB database.
   */
  data: object;
}

/**
 * Represents a MindsDB model and all supported operations.
 */
class Model {
  /** API client to use for executing model operations. */
  modelsApiClient: ModelsApiClient;

  /** Name of the model. */
  name: string;

  /** Name of the project the model belongs to. */
  project: string;

  /** Target column the model predicts. */
  targetColumn: string;

  /** Training status of the model (e.g. training, error, complete). */
  status: string;

  /** Status of the model being up to date or not.
   *  Set to 'available' when a new version of MindsDB is available that makes the model obsolete, or
   *  when new data is available in the table that was used to train the model.
   */
  updateStatus: UpdateStatus;

  /** Model version. */
  version: number;

  /** Accuracy of model predictions between 0 and 1. */
  accuracy?: number;

  /** User assigned model tag. */
  tag?: string;

  /** Whether the model is active or not. */
  active?: boolean;

  /**
   * Constructor.
   *
   * @param {ModelsApiClient} modelsApiClient
   * @param {string} name - Name of the model.
   * @param {string} project - Name of the project the model belongs to.
   * @param {string} targetColumn - Target column the model predicts.
   * @param {string} status - Training status of the model.
   * @param {UpdateStatus} updateStatus - Status of the model being up to date or not.
   * @param {number} version - Model version.
   * @param {number} [accuracy] - Accuracy of model predictions between 0 and 1.
   * @param {string} [tag] - User assigned model tag.
   */
  constructor(
    modelsApiClient: ModelsApiClient,
    name: string,
    project: string,
    targetColumn: string,
    status: string,
    updateStatus: UpdateStatus,
    version: number,
    accuracy?: number,
    tag?: string,
    active?: boolean
  ) {
    this.modelsApiClient = modelsApiClient;
    this.name = name;
    this.project = project;
    this.targetColumn = targetColumn;
    this.status = status;
    this.updateStatus = updateStatus;
    this.version = version;
    this.accuracy = accuracy;
    this.tag = tag;
    this.active = active;
  }

  /**
   * Describes the features of this model.
   * @returns {Array<ModelFeatureDescription>} - All feature descriptions of the model.
   */
  describe(): Promise<Array<ModelFeatureDescription>> {
    return this.modelsApiClient.describeModel(this.name, this.project);
  }

  /**
   * Deletes this model.
   * @throws {MindsDbError} - Something went wrong deleting this model.
   */
  delete(): Promise<void> {
    return this.modelsApiClient.deleteModel(this.name, this.project);
  }

  /**
   * Queries this model for a single prediction. For batch predictions, use batchQuery.
   * @param {QueryOptions} options - Options to use when querying the model.
   * @returns {Promise<ModelPrediction>} - The prediction result.
   * @throws {MindsDbError} - Something went wrong querying this model.
   */
  query(options: QueryOptions): Promise<ModelPrediction> {
    return this.modelsApiClient.queryModel(
      this.name,
      this.version,
      this.targetColumn,
      this.project,
      options
    );
  }

  /**
   * Queries this model for a batch prediction by joining with another data source.
   * @param {BatchQueryOptions} options - Options to use when querying the model.
   * @returns {Promise<Array<ModelPrediction>>} - All prediction results from the batch query.
   * @throws {MindsDbError} - Something went wrong batch querying this model.
   */
  batchQuery(options: BatchQueryOptions): Promise<Array<ModelPrediction>> {
    return this.modelsApiClient.batchQueryModel(
      this.name,
      this.version,
      this.targetColumn,
      this.project,
      options
    );
  }

  /**
   * Retrains this model with the given options.
   * @param {TrainingOptions} options - Options to use when retraining the model.
   * @throws {MindsDbError} - Something went wrong retraining this model.
   */
  retrain(options?: TrainingOptions): Promise<void> {
    if (options) {
      return this.modelsApiClient.retrainModel(
        this.name,
        this.targetColumn,
        this.project,
        options
      );
    }
    return this.modelsApiClient.retrainModel(
      this.name,
      this.targetColumn,
      this.project
    );
  }

  /**
   * Partially adjusts this model with the given options.
   * @param {string} integration - Integration name for the training data (e.g. mindsdb).
   * @param {AdjustOptions} options - Options to use when adjusting the model.
   * @throws {MindsDbError} - Something went wrong adjusting this model.
   */
  adjust(integration: string, options: AdjustOptions): Promise<void> {
    return this.modelsApiClient.adjustModel(this.name, this.project, options);
  }

  /**
   * Creates a Model instance from a row returned from the MindsDB database.
   * @param {ModelRow} obj - Data row from the MindsDB database.
   * @param {ModelsApiClient} modelsApiClient - Models API client to use for executing model operations.
   * @returns {Model} - New Model instance created from the given data.
   */
  static fromModelRow(obj: ModelRow, modelsApiClient: ModelsApiClient): Model {
    return new Model(
      modelsApiClient,
      obj['name'],
      obj['project'],
      obj['predict'],
      obj['status'],
      obj['update_status'],
      obj['version'],
      obj['accuracy'],
      obj['tag'],
      obj['active']
    );
  }
}

export { Model, ModelFeatureDescription, ModelPrediction, ModelRow };
