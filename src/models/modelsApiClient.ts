import { Model, ModelFeatureDescription, ModelPrediction } from './model';
import { BatchQueryOptions, QueryOptions } from './queryOptions';
import { AdjustOptions, TrainingOptions } from './trainingOptions';

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
   * @returns {Array<ModelFeatureDescription>} - All feature descriptions of the model. Empty if the model doesn't exist.
   */
  abstract describeModel(
    name: string,
    project: string
  ): Promise<Array<ModelFeatureDescription>>;

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
    options: QueryOptions
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
    options: BatchQueryOptions
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
    options: TrainingOptions
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
    options?: TrainingOptions
  ): Promise<void>;

  /**
   * Partially adjusts this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {AdjustOptions} [options] - Options to use when adjusting the model.
   * @throws {MindsDbError} - Something went wrong adjusting the model.
   */
  abstract adjustModel(
    name: string,
    project: string,
    options?: AdjustOptions
  ): Promise<void>;
}
