import ModelsApiClient from './modelsApiClient';
import mysql from 'mysql';
import { AdjustOptions, TrainingOptions } from './trainingOptions';
import SqlApiClient from '../sql/sqlApiClient';
import {
  Model,
  ModelFeatureDescription,
  ModelPrediction,
  ModelRow,
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
    options: TrainingOptions | AdjustOptions
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
    trainingOptions: TrainingOptions
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
      whereClause = `WHERE ${where[0]}\n`;
      if (where.length === 1) {
        return whereClause;
      }
      whereClause += where
        .slice(1)
        .map(
          (o) =>
            // Escaping WHERE conditions is quite tricky. We should
            // come up with a better solution to indicate WHERE conditions
            // when querying so we aren't passing a raw string.
            `AND ${o}`
        )
        .join('\n');
    } else {
      whereClause = `WHERE ${where}`;
    }
    return whereClause;
  }

  private makeTrainingUsingClause(
    options: AdjustOptions | TrainingOptions
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
    version?: number
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
      Model.fromModelRow(modelRow as ModelRow, this)
    );
  }

  /**
   * Describes the features of this model.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @returns {Array<ModelFeatureDescription>} - All feature descriptions of the model. Empty if the model doesn't exist.
   */
  override async describeModel(
    name: string,
    project: string
  ): Promise<Array<ModelFeatureDescription>> {
    const describeQuery = `DESCRIBE ${mysql.escapeId(project)}.${mysql.escapeId(
      name
    )}.features`;
    const sqlQueryResult = await this.sqlClient.runQuery(describeQuery);
    if (sqlQueryResult.rows.length === 0) {
      return [];
    }
    return sqlQueryResult.rows as Array<ModelFeatureDescription>;
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
      name
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
    options: QueryOptions
  ): Promise<ModelPrediction> {
    const selectClause = `SELECT * FROM ${mysql.escapeId(
      project
    )}.${mysql.escapeId(name)}.${version}`;
    const whereClause = this.makeWhereClause(options['where'] || []);
    const selectQuery = [selectClause, whereClause].join('\n');
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
    options: BatchQueryOptions
  ): Promise<Array<ModelPrediction>> {
    const selectClause = `SELECT m.${mysql.escapeId(
      targetColumn
    )} AS predicted, t.*, m.*`;
    const joinId = options['join'];
    const fromClause = `FROM ${mysql.escapeId(joinId)} AS t`;
    const joinClause = `JOIN ${mysql.escapeId(project)}.${mysql.escapeId(
      name
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
    ].join('\n');
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
    trainingOptions: TrainingOptions
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
      1
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
    trainingOptions?: TrainingOptions
  ): Promise<void> {
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
  }

  /**
   * Partially adjusts this model with the given options.
   * @param {string} name - Name of the model.
   * @param {string} project - Project the model belongs to.
   * @param {AdjustOptions} options - Options to use when adjusting the model.
   * @throws {MindsDbError} - Something went wrong querying the model.
   */
  override async adjustModel(
    name: string,
    project: string,
    adjustOptions: AdjustOptions
  ): Promise<void> {
    const adjustClause = `ADJUST ${mysql.escapeId(project)}.${mysql.escapeId(
      name
    )} FROM ${mysql.escapeId(adjustOptions['integration'])}`;
    const selectClause = this.makeTrainingSelectClause(adjustOptions);
    const usingClause = this.makeTrainingUsingClause(adjustOptions);
    const query = [adjustClause, selectClause, usingClause].join('\n');
    const sqlQueryResult = await this.sqlClient.runQuery(query);
    if (sqlQueryResult.error_message) {
      throw new MindsDbError(sqlQueryResult.error_message);
    }
  }
}
