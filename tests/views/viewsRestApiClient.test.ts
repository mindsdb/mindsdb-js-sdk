import axios from 'axios';
import ViewsRestApiClient from '../../src/views/viewsRestApiClient';
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

describe('Testing Views REST API client', () => {
  afterEach(() => {
    mockedSqlRestApiClient.runQuery.mockClear();
  });
  test('should get all views', async () => {
    const viewsRestApiClient = new ViewsRestApiClient(mockedSqlRestApiClient);
    const viewRows = [
      { tables_in_my_test_project: 'my_view1', table_type: 'VIEW' },
      { tables_in_my_test_project: 'my_view2', table_type: 'VIEW' },
    ];
    const unrelatedRows = [
      { tables_in_my_test_project: 'my_model', table_type: 'MODEL' },
      { tables_in_my_test_project: 'my_base_table', table_type: 'BASE_TABLE' },
    ];
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: viewRows.concat(unrelatedRows),
      });
    });

    const views = await viewsRestApiClient.getAllViews('my_test_project');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SHOW FULL TABLES FROM \`my_test_project\``;
    expect(actualQuery).toEqual(expectedQuery);

    expect(views).toHaveLength(2);
    expect(views[0].name).toEqual('my_view1');
    expect(views[0].project).toEqual('my_test_project');
    expect(views[1].name).toEqual('my_view2');
    expect(views[1].project).toEqual('my_test_project');
  });

  test('should create view', async () => {
    const viewsRestApiClient = new ViewsRestApiClient(mockedSqlRestApiClient);
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

    const view = await viewsRestApiClient.createView(
      'my_view',
      'my_test_project',
      'SELECT * FROM other_project.other_view'
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `CREATE VIEW \`my_test_project\`.\`my_view\` AS (SELECT * FROM other_project.other_view)`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(view.name).toEqual('my_view');
    expect(view.project).toEqual('my_test_project');
  });

  test('should delete', async () => {
    const viewsRestApiClient = new ViewsRestApiClient(mockedSqlRestApiClient);
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

    await viewsRestApiClient.deleteView('my_view', 'my_test_project');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `DROP MODEL \`my_test_project\`.\`my_view\``;
    expect(actualQuery).toEqual(expectedQuery);
  });
});
