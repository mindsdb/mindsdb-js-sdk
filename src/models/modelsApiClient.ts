import {
  Model,
  ModelDescribeAttribute,
  ModelFeatureDescription,
  ModelPrediction,
  ModelVersion,
} from './model';
import { BatchQueryOptions, QueryOptions } from './queryOptions';
import { FinetuneOptions, TrainingOptions } from './trainingOptions';

/**
 * Abstract class outlining Model API operations supported by the SDK.
 */
export default abstract class ModelsApiClient {
  /**
   * Gets a model by name and project.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @returns {Promise<Model | undefined>} - The matching model, or undefined if none exists.
   */
  abstract getModel(name: string, project: string): Promise<Model | undefined>;

  /**
   * Gets all models associated with a project.
   * @param {string} project - Project the models belong to.
   * @returns {Promise<Array<Model>>} - All models for the given project.
   */
  abstract getAllModels(project: string): Promise<Array<Model>>;

  /**
   * Describes the features of this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {number} [version] - Optional version of the model to describe.
   * @returns {Array<ModelFeatureDescription>} - All feature descriptions of the model. Empty if the model doesn't exist.
   */
  abstract describeModel(
    name: string,
    project: string,
    version?: number,
  ): Promise<Array<ModelFeatureDescription>>;

  /**
   * Describes the features of this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {string} attribute - The attribute to describe.
   * @param {number} [version] - Optional version of the model to describe.
   * @param {string} unique_id - Optional unique id to filter the accuracy by.
   * @returns {Array<ModelDescribeAttribute>} - All feature descriptions of the model. Empty if the model doesn't exist.
   */
  abstract describeModelAttribute(
    name: string,
    project: string,
    attribute: string,
    version?: number,
    unique_id?: string,
  ): Promise<Array<ModelDescribeAttribute>>;

  /**
   * Deletes this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @throws {MindsDB} - Something went wrong deleting the model.
   *
   */
  abstract deleteModel(name: string, project: string): Promise<void>;

  /**
   * Queries this model for a single prediction. For batch predictions, use batchQuery.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column that the model predicts.
   * @param {string} project - Project the model belongs to.
   * @param {QueryOptions} options - Options to use when querying the model.
   * @returns {Promise<ModelPrediction>} - The prediction result.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  abstract queryModel(
    name: string,
    version: number,
    targetColumn: string,
    project: string,
    options: QueryOptions,
  ): Promise<ModelPrediction>;

  /**
   * Queries this model for a batch prediction by joining with another data source.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column that the model predicts.
   * @param {string} project - Project the model belongs to.
   * @param {BatchQueryOptions} options - Options to use when querying the model.
   * @returns {Promise<Array<ModelPrediction>>} - All prediction results from the batch query.
   * @throws {MindsDbError} - Something went wrong batch querying the model.
   */
  abstract batchQueryModel(
    name: string,
    version: number,
    targetColumn: string,
    project: string,
    options: BatchQueryOptions,
  ): Promise<Array<ModelPrediction>>;

  /**
   * Trains this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column for the model to predict.
   * @param {string} project - Project the model belongs to.
   * @param {TrainingOptions} options - Options to use when training the model.
   * @throws {MindsDbError} - Something went wrong training the model.
   */
  abstract trainModel(
    name: string,
    targetColumn: string,
    project: string,
    options: TrainingOptions,
  ): Promise<Model>;

  /**
   * Rerains this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column for the model to predict.
   * @param {string} project - Project the model belongs to.
   * @param {TrainingOptions} options - Options to use when retraining the model.
   * @throws {MindsDbError} - Something went wrong retraining the model.
   */
  abstract retrainModel(
    name: string,
    targetColumn: string,
    project: string,
    options?: TrainingOptions,
  ): Promise<Model>;

  /**
   * Partially finetunes this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {FinetuneOptions} [options] - Options to use when finetuning the model.
   * @throws {MindsDbError} - Something went wrong finetuning the model.
   */
  abstract finetuneModel(
    name: string,
    project: string,
    options?: FinetuneOptions,
  ): Promise<Model>;
  /**
   * Lists all versions of the model in the specified project.
   *
   * @param {string} project - The project to list the model versions from.
   * @returns {Promise<ModelVersion[]>} - A promise that resolves to an array of ModelVersion objects.
   */
  abstract listVersions(project: string): Promise<ModelVersion[]>;

  /**
   * Gets a specific version of the model by its version number and name.
   *
   * @param {number} v - The version number to retrieve.
   * @param {string} project - The project name.
   * @param {string} name - The model name.
   * @returns {Promise<ModelVersion>} - A promise that resolves to the requested ModelVersion.
   * @throws {Error} - Throws an error if the version is not found.
   */
  abstract getVersion(
    v: number,
    project: string,
    name: string,
  ): Promise<ModelVersion>;

  /**
   * Drops a specific version of the model in the given project.
   *
   * @param {number} v - The version number to drop.
   * @param {string} project - The project name.
   * @param {string} model - The model name.
   * @returns {Promise<void>} - A promise that resolves when the version is dropped.
   * @throws {MindsDbError} - Throws an error if something goes wrong during the operation.
   */
  abstract dropVersion(
    v: number,
    project: string,
    model: string,
  ): Promise<void>;

  /**
   * Sets the active version of the specified model within a given project.
   * @param {number} v - The version number to set as active.
   * @param {string} project - The name of the project the model belongs to.
   * @param {string} model - The name of the model for which to set the active version.
   * @throws {MindsDbError} - If an error occurs while setting the active version.
   */
  abstract setActiveVersion(
    v: number,
    project: string,
    model: Model,
  ): Promise<void>;
}
