import axios from 'axios';
import Constants from '../../src/constants';
import HttpAuthenticator from '../../src/httpAuthenticator';
import ProjectsRestApiClient from '../../src/projects/projectsRestApiClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../../src/httpAuthenticator');
const mockedHttpAuthenticator =
  new HttpAuthenticator() as jest.Mocked<HttpAuthenticator>;

describe('Testing Projects REST API client', () => {
  test('getProjects returns correct data', async () => {
    const projectsRestApiClient = new ProjectsRestApiClient(
      mockedAxios,
      mockedHttpAuthenticator
    );
    // Response format of https://docs.mindsdb.com/rest/projects/get-projects.
    const expectedProject1 = { name: 'project1' };
    const expectedProject2 = { name: 'project2' };
    mockedAxios.get.mockResolvedValue({
      data: [expectedProject1, expectedProject2],
    });
    const actualProjects = await projectsRestApiClient.getAllProjects();

    const actualUrl = mockedAxios.get.mock.calls[0][0];
    const expectedUrl = new URL(
      Constants.BASE_PROJECTS_URI,
      Constants.BASE_CLOUD_API_ENDPOINT
    ).toString();
    expect(actualUrl).toEqual(expectedUrl);

    expect(actualProjects[0]).toMatchObject(expectedProject1);
    expect(actualProjects[1]).toMatchObject(expectedProject2);
  });
});
