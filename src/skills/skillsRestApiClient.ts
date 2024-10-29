import SkillsApiClient from './skillsApiClient';
import Skill, { SkillParams, SQLSkill, SQLSkillParams } from './skill';
import Project from '../projects/project';
import SqlApiClient from '../sql/sqlApiClient';
import { Axios } from 'axios';
import Constants from '../constants';

export default class SkillsRestApiClient extends SkillsApiClient {
  sqlClient: SqlApiClient;
  client: Axios;

  constructor(sqlClient: SqlApiClient, client: Axios) {
    super();
    this.sqlClient = sqlClient;
    this.client = client;
  }

  override async getAllSkills(project: string): Promise<Array<Skill>> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillsUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills`;
    const response = await this.client.get(skillsUrl);
    return response.data.map((skill: any) => Skill.fromJson(project, skill));
  }

  override async getSkill(name: string, project: string): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills/${name}`;
    const response = await this.client.get(skillUrl);
    return Skill.fromJson(project, response.data);
  }

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
  override async deleteSkill(name: string, project: string): Promise<void> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/skills/${name}`;
    await this.client.delete(skillUrl);
  }
}
