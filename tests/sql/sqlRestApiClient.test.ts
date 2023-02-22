import axios from 'axios';
import Constants from '../../src/constants';
import HttpAuthenticator from '../../src/httpAuthenticator';
import SqlRestApiClient from '../../src/sql/sqlRestApiClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../src/httpAuthenticator');
const mockedHttpAuthenticator =
  new HttpAuthenticator() as jest.Mocked<HttpAuthenticator>;

describe('Testing SQL REST API client', () => {
  test('runQuery returns correct data', async () => {
    const restApiClient = new SqlRestApiClient(
      mockedAxios,
      mockedHttpAuthenticator
    );
    // Response format of https://docs.mindsdb.com/rest/sql.
    mockedAxios.post.mockResolvedValue({
      data: {
        column_names: ['col_a', 'col_b', 'col_c'],
        context: { db: 'mindsdb' },
        type: 'table',
        data: [
          ['val_a1', 'val_b1', 'val_c1'],
          ['val_a2', 'val_b2', 'val_c2'],
          ['val_a3', 'val_b3', 'val_c3'],
        ],
      },
    });
    // Actual query doesn't matter here.
    const query = 'SELECT * FROM models';
    const queryResult = await restApiClient.runQuery(query);

    const actualUrl = mockedAxios.post.mock.calls[0][0];
    const expectedUrl = new URL(
      Constants.BASE_SQL_URI,
      Constants.BASE_CLOUD_API_ENDPOINT
    ).toString();
    const actualRequest = mockedAxios.post.mock.calls[0][1];
    const expectedRequest = { query: query };
    expect(actualUrl).toEqual(expectedUrl);
    expect(actualRequest).toMatchObject(expectedRequest);

    const expectedQueryResult = {
      columnNames: ['col_a', 'col_b', 'col_c'],
      context: { db: 'mindsdb' },
      type: 'table',
      rows: [
        { col_a: 'val_a1', col_b: 'val_b1', col_c: 'val_c1' },
        { col_a: 'val_a2', col_b: 'val_b2', col_c: 'val_c2' },
        { col_a: 'val_a3', col_b: 'val_b3', col_c: 'val_c3' },
      ],
    };
    expect(queryResult).toMatchObject(expectedQueryResult);
  });
});
