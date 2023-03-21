import axios from 'axios';
import { Model, ModelPrediction } from '../../src/models/model';
import ModelsRestApiClient from '../../src/models/modelsRestApiClient';
import SqlRestApiClient from '../../src/sql/sqlRestApiClient';
import HttpAuthenticator from '../../src/httpAuthenticator';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../src/httpAuthenticator');
const mockedHttpAuthenticator =
  new HttpAuthenticator() as jest.Mocked<HttpAuthenticator>;
jest.mock('../../src/sql/sqlRestApiClient');
const mockedSqlRestApiClient = new SqlRestApiClient(
  mockedAxios,
  mockedHttpAuthenticator
) as jest.Mocked<SqlRestApiClient>;

describe('Testing Models REST API client', () => {
  afterEach(() => {
    mockedSqlRestApiClient.runQuery.mockClear();
  });
  test('should get model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    const modelRow = {
      name: 'my_test_model',
      project: 'my_test_project',
      predict: 'my_target_column',
      status: 'my_status',
      update_status: 'my_update_status',
      version: 1,
      accuracy: 1,
      tag: 'my_tag',
    };
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [modelRow],
      });
    });

    const model =
      (await modelsRestApiClient.getModel(
        'my_test_model',
        'my_test_project'
      )) || ({} as Model);

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SELECT * FROM \`my_test_project\`.models WHERE name = 'my_test_model'`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(model.name).toEqual('my_test_model');
    expect(model.project).toEqual('my_test_project');
    expect(model.targetColumn).toEqual('my_target_column');
    expect(model.status).toEqual('my_status');
    expect(model.updateStatus).toEqual('my_update_status');
    expect(model.version).toEqual(1);
    expect(model.accuracy).toEqual(1);
    expect(model.tag).toEqual('my_tag');
  });

  test('should get all model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    const modelRow1 = {
      name: 'my_test_model1',
      project: 'my_test_project',
      predict: 'my_target_column1',
      status: 'my_status1',
      update_status: 'my_update_status1',
      version: 1,
      accuracy: 1,
      tag: 'my_tag1',
    };
    const modelRow2 = {
      name: 'my_test_model2',
      project: 'my_test_project',
      predict: 'my_target_column2',
      status: 'my_status2',
      update_status: 'my_update_status2',
      version: 2,
      accuracy: 2,
      tag: 'my_tag2',
    };
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [modelRow1, modelRow2],
      });
    });

    const models = await modelsRestApiClient.getAllModels('my_test_project');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SELECT * FROM \`my_test_project\`.models`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(models[0].name).toEqual('my_test_model1');
    expect(models[0].project).toEqual('my_test_project');
    expect(models[0].targetColumn).toEqual('my_target_column1');
    expect(models[0].status).toEqual('my_status1');
    expect(models[0].updateStatus).toEqual('my_update_status1');
    expect(models[0].version).toEqual(1);
    expect(models[0].accuracy).toEqual(1);
    expect(models[0].tag).toEqual('my_tag1');

    expect(models[1].name).toEqual('my_test_model2');
    expect(models[1].project).toEqual('my_test_project');
    expect(models[1].targetColumn).toEqual('my_target_column2');
    expect(models[1].status).toEqual('my_status2');
    expect(models[1].updateStatus).toEqual('my_update_status2');
    expect(models[1].version).toEqual(2);
    expect(models[1].accuracy).toEqual(2);
    expect(models[1].tag).toEqual('my_tag2');
  });

  test('should describe model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    const expectedModelDescriptions = [
      {
        column: 'my_column1',
        type: 'my_type1',
        encoder: 'MyEncoder1',
        role: 'my_role1',
      },
      {
        column: 'my_column2',
        type: 'my_type2',
        encoder: 'MyEncoder2',
        role: 'my_role2',
      },
    ];
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: expectedModelDescriptions,
      });
    });

    const actualModelDescriptions = await modelsRestApiClient.describeModel(
      'my_test_model',
      'my_test_project'
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `DESCRIBE \`my_test_project\`.\`my_test_model\`.features`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(actualModelDescriptions[0].column).toEqual('my_column1');
    expect(actualModelDescriptions[0].type).toEqual('my_type1');
    expect(actualModelDescriptions[0].encoder).toEqual('MyEncoder1');
    expect(actualModelDescriptions[0].role).toEqual('my_role1');

    expect(actualModelDescriptions[1].column).toEqual('my_column2');
    expect(actualModelDescriptions[1].type).toEqual('my_type2');
    expect(actualModelDescriptions[1].encoder).toEqual('MyEncoder2');
    expect(actualModelDescriptions[1].role).toEqual('my_role2');
  });

  test('should delete model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [],
      });
    });

    await modelsRestApiClient.deleteModel('my_test_model', 'my_test_project');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `DROP MODEL \`my_test_project\`.\`my_test_model\``;
    expect(actualQuery).toEqual(expectedQuery);
  });

  test('should query model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    const predictionRow = {
      target_column: 'prediction_value',
      target_column_explain: '{"confidence": 0.75}',
    };
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [predictionRow],
      });
    });

    const actualPrediction =
      (await modelsRestApiClient.queryModel(
        'my_test_model',
        1,
        'target_column',
        'my_test_project',
        {
          where: ['field1 = val1', 'field2 = val2'],
        }
      )) || ({} as ModelPrediction);

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SELECT * FROM \`my_test_project\`.\`my_test_model\`.1
WHERE field1 = val1
AND field2 = val2`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(actualPrediction.value).toEqual('prediction_value');
    expect(actualPrediction.explain).toMatchObject({ confidence: 0.75 });
    expect(actualPrediction.data).toMatchObject(predictionRow);
  });

  test('should batch query model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    const predictionRow1 = {
      predicted: 'prediction_value1',
      target_column_explain: '{"confidence": 0.75}',
    };
    const predictionRow2 = {
      predicted: 'prediction_value2',
    };
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [predictionRow1, predictionRow2],
      });
    });

    const actualPredictions = await modelsRestApiClient.batchQueryModel(
      'my_test_model',
      1,
      'target_column',
      'my_test_project',
      {
        where: ['t.field1 = val1', 't.field2 = val2'],
        join: 'my_db.my_table',
        limit: 3,
      }
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SELECT m.\`target_column\` AS predicted, t.*, m.*
FROM \`my_db\`.\`my_table\` AS t
JOIN \`my_test_project\`.\`my_test_model\`.1 AS m
WHERE t.field1 = val1
AND t.field2 = val2
LIMIT 3`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(actualPredictions[0].value).toEqual('prediction_value1');
    expect(actualPredictions[0].explain).toMatchObject({ confidence: 0.75 });
    expect(actualPredictions[0].data).toMatchObject(predictionRow1);

    expect(actualPredictions[1].value).toEqual('prediction_value2');
    expect(actualPredictions[1].explain).toMatchObject({});
    expect(actualPredictions[1].data).toMatchObject(predictionRow2);
  });

  test('should train model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [],
      });
    });

    await modelsRestApiClient.trainModel(
      'my_test_model',
      'target_column',
      'my_test_project',
      {
        integration: 'my_integration',
        select: 'SELECT * FROM my_db.my_table',
        groupBy: 'group_col',
        orderBy: 'order_col',
        window: 6,
        horizon: 9,
        using: {
          tag: 'test-tag',
          labels: ['test-label'],
          'model.args': {},
        },
      }
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `CREATE MODEL \`my_test_project\`.\`my_test_model\`
FROM \`my_integration\`
(SELECT * FROM my_db.my_table)
PREDICT \`target_column\`
GROUP BY \`group_col\`
ORDER BY \`order_col\`
WINDOW 6
HORIZON 9
USING
\`tag\` = 'test-tag',
\`labels\` = ["test-label"],
\`model\`.\`args\` = {}`;

    expect(actualQuery).toEqual(expectedQuery);
  });

  test('should retrain model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [],
      });
    });

    await modelsRestApiClient.retrainModel(
      'my_test_model',
      'target_column',
      'my_test_project',
      {
        integration: 'my_integration',
        select: 'SELECT * FROM my_db.my_table',
        groupBy: 'group_col',
        orderBy: 'order_col',
        window: 6,
        horizon: 9,
        using: {
          tag: 'test-tag',
          labels: ['test-label'],
          'model.args': {},
        },
      }
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `RETRAIN \`my_test_project\`.\`my_test_model\`
FROM \`my_integration\`
(SELECT * FROM my_db.my_table)
PREDICT \`target_column\`
GROUP BY \`group_col\`
ORDER BY \`order_col\`
WINDOW 6
HORIZON 9
USING
\`tag\` = 'test-tag',
\`labels\` = ["test-label"],
\`model\`.\`args\` = {}`;

    expect(actualQuery).toEqual(expectedQuery);
  });

  test('should adjust model', async () => {
    const modelsRestApiClient = new ModelsRestApiClient(mockedSqlRestApiClient);
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: [],
      });
    });

    await modelsRestApiClient.adjustModel(
      'my_test_model',
      'my_test_project',
      {
        select: 'SELECT * FROM my_db.my_table',
        integration: 'my_integration',
        using: {
          tag: 'test-tag',
          labels: ['test-label'],
          'model.args': {},
        },
      }
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `ADJUST \`my_test_project\`.\`my_test_model\` FROM \`my_integration\`
(SELECT * FROM my_db.my_table)
USING
\`tag\` = 'test-tag',
\`labels\` = ["test-label"],
\`model\`.\`args\` = {}`;

    expect(actualQuery).toEqual(expectedQuery);
  });
});
