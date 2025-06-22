import ModelsApiClient from './modelsApiClient';
import mysql from 'mysql';
import { FinetuneOptions, TrainingOptions } from './trainingOptions';
import SqlApiClient from '../sql/sqlApiClient';
import {
  Model,
  ModelDescribeAttribute,
  ModelFeatureDescription,
  ModelPrediction,
  ModelRow,
  ModelVersion,
} from './model';
import { BatchQueryOptions, QueryOptions } from './queryOptions';
import { MindsDbError } from '../errors';

/** Implementation of ModelsApiClient that goes through the REST API */
export default class ModelsRestApiClient extends ModelsApiClient {
  /** SQL API client to send all SQL query requests. */
  sqlClient: SqlApiClient;

  /**
   *
   * @param {SqlApiClient} sqlClient - SQL API client to send all SQL query requests.
   */
  constructor(sqlClient: SqlApiClient) {
    super();
    this.sqlClient = sqlClient;
  }

  private makeRetrainClause(name: string, project: string): string {
    return `RETRAIN ${mysql.escapeId(project)}.${mysql.escapeId(name)}`;
  }

  private makeTrainingCreateClause(name: string, project: string): string {
    return `CREATE MODEL ${mysql.escapeId(project)}.${mysql.escapeId(name)}`;
  }

  private makeTrainingFromClause(options: TrainingOptions): string {
    const integration = options['integration'];
    if (integration) {
      return `FROM ${mysql.escapeId(integration)}`;
    }
    return '';
  }

  private makeTrainingSelectClause(
    options: TrainingOptions | FinetuneOptions,
  ): string {
    const select = options['select'];
    if (select) {
      return `(${select})`;
    }
    return '';
  }

  private makeTrainingPredictClause(targetColumn: string): string {
    return `PREDICT ${mysql.escapeId(targetColumn)}`;
  }

  private makeTrainingOrderByClause(trainingOptions: TrainingOptions): string {
    const orderByColumn = trainingOptions['orderBy'];
    if (!orderByColumn) {
      return '';
    }
    return `ORDER BY ${mysql.escapeId(orderByColumn)}`;
  }

  private makeTrainingGroupByClause(trainingOptions: TrainingOptions): string {
    const groupByColumn = trainingOptions['groupBy'];
    if (!groupByColumn) {
      return '';
    }
    return `GROUP BY ${mysql.escapeId(groupByColumn)}`;
  }

  private makeTrainingWindowHorizonClause(
    trainingOptions: TrainingOptions,
  ): string {
    const window = trainingOptions['window'];
    const horizon = trainingOptions['horizon'];
    if (!window || !horizon) {
      return '';
    }
    return `WINDOW ${mysql.escape(window)}\nHORIZON ${mysql.escape(horizon)}`;
  }

  private makeWhereClause(where: string | Array<string>) {
    let whereClause = '';
    if (Array.isArray(where)) {
      if (where.length === 0) {
        return whereClause;
      }
      whereClause = `WHERE ${where[0]}`;
      if (where.length === 1) {
        return whereClause;
      }
      whereClause += '\n' + where
        .slice(1)
        .map(
          (o) =>
            // Escaping WHERE conditions is quite tricky. We should
            // come up with a better solution to indicate WHERE conditions
            // when querying so we aren't passing a raw string.
            `AND ${o}`,
        )
        .join('\n');
    } else if (where) {
      whereClause = `WHERE ${where}`;
    }
    return whereClause;
  }

  private makeUsingClause (using: string | Array<string>): string {
    if (!using) {
      return '';
    }
    if (!Array.isArray(using)) {
      return `USING ${using}\n`;
    }
    if (using.length === 0) {
      return '';
    }
    let usingClause = `USING\n`;
    for (let i = 0; i < using.length - 1; i++) {
      usingClause += using[i] + `,\n`;
    }
    usingClause += using[using.length -1 ] + `\n`;
    return usingClause;
  }

  private makeTrainingUsingClause(
    options: FinetuneOptions | TrainingOptions,
  ): string {
    const using = options['using'];
    if (!using) {
      return '';
    }
    const allParams = [];
    for (const param in using) {
      let paramVal = using[param];
      if (Array.isArray(paramVal) || typeof paramVal === 'object') {
        // MindsDB SQL allows param values to be objects and arrays, not just primitives.
        paramVal = JSON.stringify(paramVal);
      } else {
        paramVal = mysql.escape(paramVal);
      }
      allParams.push(`${mysql.escapeId(param)} = ${paramVal}`);
    }
    return `USING\n${allParams.join(',\n')}`;
  }

  /**
   * Gets a model by name and project.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {number} version - The version of the model.
   * @returns {Promise<Model | undefined>} - The matching model, or undefined if none exists.
   */
  override async getModel(
    name: string,
    project: string,
    version?: number,
  ): Promise<Model | undefined> {
    const selectQuery = `SELECT * FROM ${mysql.escapeId(project)}.models${
      version ? '_versions' : ''
    } WHERE name = ${mysql.escape(name)}${
      version ? ` and version = ${mysql.escape(version)}` : ''
    }`;
    const sqlQueryResult = await this.sqlClient.runQuery(selectQuery);
    if (sqlQueryResult.rows?.length === 0) {
      return undefined;
    }
    return Model.fromModelRow(sqlQueryResult.rows[0] as ModelRow, this);
  }

  /**
   * Gets all models associated with a project.
   * @param {string} project - Project the models belong to.
   * @returns {Promise<Array<Model>>} - All models for the given project.
   */
  override async getAllModels(project: string): Promise<Array<Model>> {
    const selectQuery = `SELECT * FROM ${mysql.escapeId(project)}.models`;
    const sqlQueryResult = await this.sqlClient.runQuery(selectQuery);
    return sqlQueryResult.rows.map((modelRow) =>
      Model.fromModelRow(modelRow as ModelRow, this),
    );
  }

  /**
   * Describes the features of this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {number} [version] - Optional version of the model to describe.
   * @returns {Array<ModelFeatureDescription>} - All feature descriptions of the model. Empty if the model doesn't exist.
   */
  override async describeModel(
    name: string,
    project: string,
    version?: number,
  ): Promise<Array<ModelFeatureDescription>> {
    const describeQuery = `DESCRIBE ${mysql.escapeId(project)}.${mysql.escapeId(
      name,
    )}.${version ? `${mysql.escapeId(version.toString())}.` : ''}\`features\``;
    const sqlQueryResult = await this.sqlClient.runQuery(describeQuery);
    if (sqlQueryResult.rows.length === 0) {
      return [];
    }
    return sqlQueryResult.rows as Array<ModelFeatureDescription>;
  }

  /**
   * Describes the features of this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {string} attribute - The attribute to describe.
   * @param {number} [version] - Optional version of the model to describe.
   * @param {string} unique_id - Optional unique id to filter the accuracy by.
   * @returns {Array<ModelDescribeAttribute>} - All feature descriptions of the model. Empty if the model doesn't exist.
   */
  override async describeModelAttribute(
    name: string,
    project: string,
    attribute: string,
    version?: number,
    unique_id?: string,
  ): Promise<Array<ModelDescribeAttribute>> {
    const describeQuery = `DESCRIBE ${mysql.escapeId(project)}.${mysql.escapeId(
      name,
    )}.${version ? `${mysql.escapeId(version.toString())}.` : ''}${mysql.escapeId(attribute)}${unique_id ? `.${mysql.escapeId(unique_id)}` : ''}`;
    const sqlQueryResult = await this.sqlClient.runQuery(describeQuery);
    if (sqlQueryResult.rows.length === 0) {
      return [];
    }
    return sqlQueryResult.rows as Array<ModelDescribeAttribute>;
  }

  /**
   * Deletes this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @throws {MindsDB} - Something went wrong deleting the model.
   *
   */
  override async deleteModel(name: string, project: string): Promise<void> {
    const deleteQuery = `DROP MODEL ${mysql.escapeId(project)}.${mysql.escapeId(
      name,
    )}`;
    const sqlQueryResult = await this.sqlClient.runQuery(deleteQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  /**
   * Queries this model for a single prediction. For batch predictions, use batchQuery.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column that the model predicts.
   * @param {string} project - Project the model belongs to.
   * @param {QueryOptions} options - Options to use when querying the model.
   * @returns {Promise<ModelPrediction>} - The prediction result.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  override async queryModel(
    name: string,
    version: number,
    targetColumn: string,
    project: string,
    options: QueryOptions,
  ): Promise<ModelPrediction> {
    const selectClause = `SELECT * FROM ${mysql.escapeId(
      project,
    )}.${mysql.escapeId(name)}.${version}`;
    const whereClause = this.makeWhereClause(options['where'] || []);
    const usingClause = this.makeUsingClause(options['using'] || []);
    const selectQuery = [selectClause, whereClause, usingClause]
      .filter(Boolean)
      .join('\n');
    const sqlQueryResult = await this.sqlClient.runQuery(selectQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    const predictionRow = sqlQueryResult.rows[0];
    const prediction = {
      value: predictionRow[targetColumn],
      explain: predictionRow[`${targetColumn}_explain`],
      data: predictionRow,
    };
    return prediction;
  }

  /**
   * Queries this model for a batch prediction by joining with another data source.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column that the model predicts.
   * @param {string} project - Project the model belongs to.
   * @param {BatchQueryOptions} options - Options to use when querying the model.
   * @returns {Promise<Array<ModelPrediction>>} - All prediction results from the batch query.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  override async batchQueryModel(
    name: string,
    version: number,
    targetColumn: string,
    project: string,
    options: BatchQueryOptions,
  ): Promise<Array<ModelPrediction>> {
    const selectClause = `SELECT m.${mysql.escapeId(
      targetColumn,
    )} AS predicted, t.*, m.*`;
    const joinId = options['join'];
    const fromClause = `FROM ${mysql.escapeId(joinId)} AS t`;
    const joinClause = `JOIN ${mysql.escapeId(project)}.${mysql.escapeId(
      name,
    )}.${version} AS m`;
    const whereClause = this.makeWhereClause(options['where'] || []);
    const limitClause = options['limit']
      ? `LIMIT ${mysql.escape(options['limit'])}`
      : '';
    const selectQuery = [
      selectClause,
      fromClause,
      joinClause,
      whereClause,
      limitClause,
    ]
      .filter(Boolean)
      .join('\n');
    const sqlQueryResult = await this.sqlClient.runQuery(selectQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return sqlQueryResult.rows.map((r) => ({
      value: r['predicted'],
      explain: r[`${targetColumn}_explain`],
      data: r,
    }));
  }

  /**
   * Trains this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column for the model to predict.
   * @param {string} project - Project the model belongs to.
   * @param {TrainingOptions} options - Options to use when training the model.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  override async trainModel(
    name: string,
    targetColumn: string,
    project: string,
    trainingOptions: TrainingOptions,
  ): Promise<Model> {
    const createClause = this.makeTrainingCreateClause(name, project);
    const fromClause = this.makeTrainingFromClause(trainingOptions);
    const selectClause = this.makeTrainingSelectClause(trainingOptions);
    const predictClause = this.makeTrainingPredictClause(targetColumn);
    const orderByClause = this.makeTrainingOrderByClause(trainingOptions);
    const groupByClause = this.makeTrainingGroupByClause(trainingOptions);
    const windowHorizonClause =
      this.makeTrainingWindowHorizonClause(trainingOptions);
    const usingClause = this.makeTrainingUsingClause(trainingOptions);

    const query = [
      createClause,
      fromClause,
      selectClause,
      predictClause,
      groupByClause,
      orderByClause,
      windowHorizonClause,
      usingClause,
    ]
      .filter((s) => s)
      .join('\n');
    const sqlQueryResult = await this.sqlClient.runQuery(query);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
    return new Model(
      this,
      name,
      project,
      targetColumn,
      'generating',
      'up_to_date',
      1,
    );
  }

  /**
   * Rerains this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} targetColumn - Column for the model to predict.
   * @param {string} project - Project the model belongs to.
   * @param {string} [integration] - Integration name for the training data (e.g. mindsdb).
   * @param {TrainingOptions} [options] - Options to use when retraining the model.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  override async retrainModel(
    name: string,
    targetColumn: string,
    project: string,
    trainingOptions?: TrainingOptions,
  ): Promise<Model> {
    const retrainClause = this.makeRetrainClause(name, project);
    let query = retrainClause;
    if (trainingOptions) {
      const fromClause = this.makeTrainingFromClause(trainingOptions);
      const selectClause = this.makeTrainingSelectClause(trainingOptions);
      const predictClause = this.makeTrainingPredictClause(targetColumn);
      const orderByClause = this.makeTrainingOrderByClause(trainingOptions);
      const groupByClause = this.makeTrainingGroupByClause(trainingOptions);
      const windowHorizonClause =
        this.makeTrainingWindowHorizonClause(trainingOptions);
      const usingClause = this.makeTrainingUsingClause(trainingOptions);
      query = [
        retrainClause,
        fromClause,
        selectClause,
        predictClause,
        groupByClause,
        orderByClause,
        windowHorizonClause,
        usingClause,
      ]
        .filter((s) => s)
        .join('\n');
    }

    const sqlQueryResult = await this.sqlClient.runQuery(query);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }

    return Model.fromModelRow(sqlQueryResult.rows[0] as ModelRow, this);
  }

  /**
   * Partially finetune this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {FinetuneOptions} options - Options to use when finetuning the model.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  override async finetuneModel(
    name: string,
    project: string,
    finetuneOptions: FinetuneOptions,
  ): Promise<Model> {
    const finetuneClause = `FINETUNE ${mysql.escapeId(project)}.${mysql.escapeId(
      name,
    )} FROM ${mysql.escapeId(finetuneOptions['integration'])}`;
    const selectClause = this.makeTrainingSelectClause(finetuneOptions);
    const usingClause = this.makeTrainingUsingClause(finetuneOptions);
    const query = [finetuneClause, selectClause, usingClause]
      .filter(Boolean)
      .join('\n');
    const sqlQueryResult = await this.sqlClient.runQuery(query);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }

    return Model.fromModelRow(sqlQueryResult.rows[0] as ModelRow, this);
  }

  /**
   * List all versions of the model in the specified project.
   *
   * @param {string} project - The project to list the model versions from.
   * @returns {Promise<ModelVersion[]>} - A promise that resolves to an array of ModelVersion objects.
   */
  override async listVersions(project: string): Promise<ModelVersion[]> {
    const allModels = await this.getAllModels(project);
    return allModels.map((model: any) => new ModelVersion(project, model));
  }

  /**
   * Get a specific version of the model by its version number and name.
   *
   * @param {number} v - The version number to retrieve.
   * @param {string} project - The project name.
   * @param {string} name - The model name.
   * @returns {Promise<ModelVersion>} - A promise that resolves to the requested ModelVersion.
   * @throws {Error} - Throws an error if the version is not found.
   */
  override async getVersion(
    v: number,
    project: string,
    name: string,
  ): Promise<ModelVersion> {
    const allModels = await this.listVersions(project);
    for (const model of allModels) {
      if (model.version === v && model.name === name) {
        return model;
      }
    }
    throw new Error('Version is not found');
  }

  /**
   * Drop a specific version of the model in the given project.
   *
   * @param {number} v - The version number to drop.
   * @param {string} project - The project name.
   * @param {string} model - The model name.
   * @returns {Promise<void>} - A promise that resolves when the version is dropped.
   * @throws {MindsDbError} - Throws an error if something goes wrong during the operation.
   */
  override async dropVersion(
    v: number,
    project: string,
    model: string,
  ): Promise<void> {
    const deleteQuery = `DROP MODEL ${mysql.escapeId(project)}.${mysql.escapeId(
      model,
    )}.${mysql.escapeId(v.toString())}`;
    const sqlQueryResult = await this.sqlClient.runQuery(deleteQuery);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }

  /**
   * Sets the active version of the specified model within a given project.
   * @param {number} v - The version number to set as active.
   * @param {string} project - The name of the project the model belongs to.
   * @param {Model} model - The model for which to set the active version.
   * @throws {MindsDbError} - If an error occurs while setting the active version.
   */
  override async setActiveVersion(v: number, project: string, model: Model) {
    const query = `SET model_active = ${mysql.escapeId(project)}.${mysql.escapeId(
      model.name,
    )}.${mysql.escapeId(v.toString())};`;
    await this.sqlClient
      .runQuery(query)
      .then(
        async () =>
          (model =
            (await this.getModel(model.name, project)) ??
            new ModelVersion(project, { ...model, version: v })),
      );
  }
}