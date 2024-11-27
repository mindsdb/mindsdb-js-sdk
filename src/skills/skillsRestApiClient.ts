import SkillsApiClient from './skillsApiClient';
import Skill, { SkillParams, SQLSkill, SQLSkillParams } from './skill';
import SqlApiClient from '../sql/sqlApiClient';
import { Axios } from 'axios';
import Constants from '../constants';

/** Implementation of SkillApiClient that goes through the REST API */
export default class SkillsRestApiClient extends SkillsApiClient {
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /**
   *
   * @param {Axios} client - Axios client to send all HTTP requests.
   */
  constructor(client: Axios) {
    super();
    this.client = client;
  }

  /**
   * Retrieves all skills associated with a given project.
   *
   * @param {string} project - Project name skill belongs to
   * @returns {Array<Skill>} - Array of skills
   */
  override async getAllSkills(project: string): Promise<Array<Skill>> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillsUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills`;
    const response = await this.client.get(skillsUrl);
    return response.data.map((skill: any) => Skill.fromJson(project, skill));
  }

  /**
   * Retrieves a specific skill by name within a given project.
   *
   * @param name - Name of the skill.
   * @param project - Name of the project.
   * @returns {Skill} - The skill.
   */
  override async getSkill(name: string, project: string): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills/${name}`;
    const response = await this.client.get(skillUrl);
    return Skill.fromJson(project, response.data);
  }

  /**
   * Creates a new skill within a given project.
   *
   * @param name - Name of the skill.
   * @param type - Type of the skill.
   * @param project - Name of the project.
   * @param params - Parameters for the skill.
   * @returns {Skill} - The created skill.
   */
  override async createSkill(
    name: string,
    type: string,
    project: string,
    params: SkillParams
  ): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills`;
    await this.client.post(skillUrl, {
      skill: {
        name,
        type,
        params,
      },
    });
    if (type === 'sql') {
      const sqlParams = params as SQLSkillParams;
      const sqlSkill = new SQLSkill(
        name,
        sqlParams.tables,
        sqlParams.database,
        project
      );
      return sqlSkill;
    } else {
      return new Skill(name, type, project, params);
    }
  }

  /**
   * Updates an existing skill within a given project.
   *
   * @param name - Name of the skill
   * @param project  - Name of the project
   * @param updatedSkill  - Updated skill object
   * @returns {Skill} - The updated skill
   */
  override async updateSkill(
    name: string,
    project: string,
    updatedSkill: Skill
  ): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills/${name}`;
    const response = await this.client.put(skillUrl, {
      skill: {
        name: updatedSkill.name,
        type: updatedSkill.type,
        params: updatedSkill.params,
      },
    });

    return Skill.fromJson(updatedSkill.project, response.data);
  }

  /**
   *  Deletes a specific skill by name within a given project.
   *
   * @param name - Name of the skill
   * @param project  - Name of the project
   */
  override async deleteSkill(name: string, project: string): Promise<void> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills/${name}`;
    await this.client.delete(skillUrl);
  }
}
