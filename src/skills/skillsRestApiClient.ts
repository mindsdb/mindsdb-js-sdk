import SkillsApiClient from './skillsApiClient';
import Skill, { SkillParams, SQLSkill, SQLSkillParams } from './skill';
import Project from '../projects/project';
import SqlApiClient from '../sql/sqlApiClient';
import { Axios } from 'axios';
import Constants from '../constants';

export default class SkillsRestApiClient extends SkillsApiClient {
  project: Project;
  sqlClient: SqlApiClient;
  client: Axios;

  constructor(project: Project, sqlClient: SqlApiClient, client: Axios) {
    super();
    this.project = project;
    this.sqlClient = sqlClient;
    this.client = client;
  }

  async getAllSkills(): Promise<Array<Skill>> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillsUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${this.project.name}/skills`;
    const response = await this.client.get(skillsUrl);
    return response.data.map((skill: any) => Skill.fromJson(skill));
  }

  async getSkill(name: string): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${this.project.name}/skills/${name}`;
    const response = await this.client.get(skillUrl);
    return Skill.fromJson(response.data);
  }

  async createSkill(
    name: string,
    type: string,
    params: SkillParams
  ): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${this.project.name}/skills`;
    const response = await this.client.post(skillUrl, {
      skill: {
        name,
        type,
        params,
      },
    });
    if (type === 'sql') {
      const sqlParams = params as SQLSkillParams;
      const sqlSkill = new SQLSkill(name, sqlParams.tables, sqlParams.database);
      return sqlSkill;
    } else {
      return new Skill(name, type, params);
    }
  }
  async updateSkill(name: string, updatedSkill: Skill): Promise<Skill> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${this.project.name}/skills/${name}`;
    const response = await this.client.put(skillUrl, {
      skill: {
        name: updatedSkill.name,
        type: updatedSkill.type,
        params: updatedSkill.params,
      },
    });

    return Skill.fromJson(response.data);
  }
  async deleteSkill(name: string): Promise<void> {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const skillUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${this.project.name}/skills/${name}`;
    await this.client.delete(skillUrl);
  }
}
