import axios from 'axios';
import DatabasesRestApiClient from '../../src/databases/databasesRestApiClient';
import HttpAuthenticator from '../../src/httpAuthenticator';
import SqlRestApiClient from '../../src/sql/sqlRestApiClient';

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

describe('Testing Databases REST API client', () => {
  afterEach(() => {
    mockedSqlRestApiClient.runQuery.mockClear();
  });
  test('should get database', async () => {
    const databasesRestApiClient = new DatabasesRestApiClient(
      mockedSqlRestApiClient
    );
    const databaseRows = [
      { database: 'test_db', type: 'data', engine: 'files' },
      { database: 'not_the_db', type: 'project', engine: undefined },
      { database: 'also_not_the_db', type: 'data', engine: 'postgres' },
    ];
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: databaseRows,
      });
    });

    const database = await databasesRestApiClient.getDatabase('test_db');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SHOW FULL DATABASES`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(database?.name).toEqual('test_db');
    expect(database?.type).toEqual('data');
    expect(database?.engine).toEqual('files');
  });

  test('should get all databases', async () => {
    const databasesRestApiClient = new DatabasesRestApiClient(
      mockedSqlRestApiClient
    );
    const databaseRows = [
      { database: 'test_db', type: 'data', engine: 'files' },
      { database: 'test_db2', type: 'project', engine: undefined },
    ];
    mockedSqlRestApiClient.runQuery.mockImplementation(() => {
      return Promise.resolve({
        columnNames: [],
        context: {
          db: 'mindsdb',
        },
        type: 'ok',
        rows: databaseRows,
      });
    });

    const databases = await databasesRestApiClient.getAllDatabases();

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `SHOW FULL DATABASES`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(databases).toHaveLength(2);
    expect(databases[0].name).toEqual('test_db');
    expect(databases[0].type).toEqual('data');
    expect(databases[0].engine).toEqual('files');
    expect(databases[1].name).toEqual('test_db2');
    expect(databases[1].type).toEqual('project');
    expect(databases[1].engine).toBeUndefined();
  });

  test('should create database', async () => {
    const databasesRestApiClient = new DatabasesRestApiClient(
      mockedSqlRestApiClient
    );
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

    const params = {
      user: 'test_user',
      password: 'test_password',
      port: 9001,
      args: { nested: true },
    };
    const database = await databasesRestApiClient.createDatabase(
      'test_db',
      'test_engine',
      params
    );

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `CREATE DATABASE test_db
WITH ENGINE = 'test_engine',
PARAMETERS = {"user":"test_user","password":"test_password","port":9001,"args":{"nested":true}}`;
    expect(actualQuery).toEqual(expectedQuery);

    expect(database.name).toEqual('test_db');
    expect(database.type).toEqual('data');
    expect(database.engine).toEqual('test_engine');
  });

  test('should delete database', async () => {
    const databasesRestApiClient = new DatabasesRestApiClient(
      mockedSqlRestApiClient
    );
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

    await databasesRestApiClient.deleteDatabase('test_db');

    const actualQuery = mockedSqlRestApiClient.runQuery.mock.calls[0][0];
    const expectedQuery = `DROP DATABASE \`test_db\``;
    expect(actualQuery).toEqual(expectedQuery);
  });
});
