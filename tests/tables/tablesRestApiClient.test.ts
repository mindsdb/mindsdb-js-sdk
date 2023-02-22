import axios from 'axios';

import TablesRestApiClient from '../../src/tables/tablesRestApiClient';
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
  test('should create table', async () => {
    const tablesRestApiClient = new TablesRestApiClient(mockedSqlRestApiClient);
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

    const table = await tablesRestApiClient.createTable(
      'my_table',
      'my_integration',
      'SELECT * FROM other_integration.other_table'
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `CREATE TABLE \`my_integration\`.\`my_table\`
(SELECT * FROM other_integration.other_table)`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(table.name).toEqual('my_table');
    expect(table.integration).toEqual('my_integration');
  });

  test('should create or replace table', async () => {
    const tablesRestApiClient = new TablesRestApiClient(mockedSqlRestApiClient);
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

    const table = await tablesRestApiClient.createOrReplaceTable(
      'my_table',
      'my_integration',
      'SELECT * FROM other_integration.other_table'
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `CREATE OR REPLACE TABLE \`my_integration\`.\`my_table\`
(SELECT * FROM other_integration.other_table)`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(table.name).toEqual('my_table');
    expect(table.integration).toEqual('my_integration');
  });

  test('should delete table', async () => {
    const tablesRestApiClient = new TablesRestApiClient(mockedSqlRestApiClient);
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

    await tablesRestApiClient.deleteTable('my_table', 'my_integration');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `DROP TABLE \`my_integration\`.\`my_table\``;
    expect(actualQuery).toEqual(expectedQuery);
  });
});
