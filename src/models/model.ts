import { JsonPrimitive } from '../util/json';
import ModelsApiClient from './modelsApiClient';
import { BatchQueryOptions, QueryOptions } from './queryOptions';
import { FinetuneOptions, TrainingOptions } from './trainingOptions';

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

interface ModelDescribeAttribute {
  [key: string]: unknown;
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
    active?: boolean,
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
    return this.modelsApiClient.describeModel(
      this.name,
      this.project,
      this.version,
    );
  }

  /**
   * Lists all models in the project.
   * @returns {Array<Model>} - All models in the project.
   */
  listModels(): Promise<Array<Model>> {
    return this.modelsApiClient.getAllModels(this.project);
  }

  /**
   * Describes an attribute of this model.
   * @param {string} attribute - The attribute to describe.
   * @param {string} unique_id - Optional unique id to filter the accuracy by.
   * @returns {Array<ModelDescribeAttribute>} - Result.
   */
  describeAttribute(
    attribute: string,
    unique_id?: string,
  ): Promise<Array<ModelDescribeAttribute>> {
    return this.modelsApiClient.describeModelAttribute(
      this.name,
      this.project,
      attribute,
      this.version,
      unique_id,
    );
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
      options,
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
      options,
    );
  }

  /**
   * Retrains this model with the given options.
   * @param {TrainingOptions} options - Options to use when retraining the model.
   * @throws {MindsDbError} - Something went wrong retraining this model.
   */
  retrain(options?: TrainingOptions): Promise<Model> {
    if (options) {
      return this.modelsApiClient.retrainModel(
        this.name,
        this.targetColumn,
        this.project,
        options,
      );
    }
    return this.modelsApiClient.retrainModel(
      this.name,
      this.targetColumn,
      this.project,
    );
  }

  /**
   * Partially finetune this model with the given options.
   * @param {string} integration - Integration name for the training data (e.g. mindsdb).
   * @param {FinetuneOptions} options - Options to use when finetuning the model.
   * @throws {MindsDbError} - Something went wrong finetuning this model.
   */
  finetune(integration: string, options: FinetuneOptions): Promise<Model> {
    return this.modelsApiClient.finetuneModel(this.name, this.project, options);
  }
  /**
   * List all versions of the model.
   *
   * @returns {Promise<ModelVersion[]>} - A promise that resolves to an array of ModelVersion objects.
   */
  listVersions(): Promise<ModelVersion[]> {
    return this.modelsApiClient.listVersions(this.project);
  }

  /**
   * Get a specific version of the model by its version number.
   *
   * @param {number} v - The version number to retrieve.
   * @returns {Promise<ModelVersion>} - A promise that resolves to the requested ModelVersion.
   */
  getVersion(v: number): Promise<ModelVersion> {
    return this.modelsApiClient.getVersion(
      Math.floor(v),
      this.project,
      this.name,
    );
  }

  /**
   * Drop a specific version of the model.
   *
   * @param {number} v - The version number to drop.
   * @param {string} [project=this.project] - The project name. Defaults to the current project.
   * @param {string} [model=this.name] - The model name. Defaults to the current model.
   * @returns {Promise<void>} - A promise that resolves when the version is dropped.
   */
  dropVersion(
    v: number,
    project: string = this.project,
    model: string = this.name,
  ): Promise<void> {
    return this.modelsApiClient.dropVersion(Math.floor(v), project, model);
  }
  /**
   * Sets the active version of the specified model within a given project.
   * @param {number} v - The version number to set as active.
   */
  setActiveVersion(v: number): Promise<void> {
    return this.modelsApiClient.setActiveVersion(
      Math.floor(v),
      this.project,
      this,
    );
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
      obj['active'],
    );
  }
}

/**
 * Represents a MindsDB model with version and all supported operations.
 */
class ModelVersion extends Model {
  /**
   * Constructor for ModelVersion.
   *
   * @param {string} project - Name of the project the model belongs to.
   * @param {object} data - Data containing the model details.
   */
  constructor(
    project: string,
    data: {
      modelsApiClient: ModelsApiClient;
      name: string;
      targetColumn: string;
      status: string;
      updateStatus: UpdateStatus;
      version: number;
      accuracy?: number;
      tag?: string;
      active?: boolean;
    },
  ) {
    super(
      data.modelsApiClient,
      data.name,
      project,
      data.targetColumn,
      data.status,
      data.updateStatus,
      data.version,
      data.accuracy,
      data.tag,
      data.active,
    );
    this.version = data.version;
  }
}

export {
  Model,
  ModelFeatureDescription,
  ModelPrediction,
  ModelRow,
  ModelDescribeAttribute,
  ModelVersion,
};
