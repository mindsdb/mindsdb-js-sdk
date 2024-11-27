import { Axios } from 'axios';
import Constants from '../constants';
import { MindsDbError } from '../errors';
import Agent from './agent';
import AgentsApiClient from './agentsApiClient';

const DEFAULT_LLM_PROMPT =
  "Answer the user's question in a helpful way: {{question}}";
const DEFAULT_LLM_MODEL = 'gpt-4o';

/** Implementation of AgentsApiClient that goes through the REST API */
export default class AgentsRestApiClient extends AgentsApiClient {
  /** Axios client to use for making HTTP requests */
  client: Axios;

  /**
   * Creates a new AgentsRestApiClient.
   *
   * @param {Axios} client - Axios client to use for making HTTP requests
   */
  constructor(client: Axios) {
    super();
    this.client = client;
  }

  private getAgentsUrl(project: string): string {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const agentsUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${project}/agents`;
    return agentsUrl;
  }

  /**
   * Retrieves all agents for a given project.
   *
   * @param project Project name to which agent belongs to
   * @returns {Promise<Array<Agent>>} A promise that resolves to an array of agents.
   */
  override async getAllAgents(project: string): Promise<Array<Agent>> {
    const agentsUrl = this.getAgentsUrl(project);
    try {
      const agentsResponse = await this.client.get(agentsUrl);
      if (!agentsResponse.data) {
        return [];
      }
      return agentsResponse.data.map((agent: any) =>
        Agent.fromJson(project, agent, this)
      );
    } catch (error) {
      throw MindsDbError.fromHttpError(error, agentsUrl);
    }
  }

  /**
   * Retrieves a specific agent by its name.
   *
   * @param {string} project Project name to which agent belongs to
   * @param {string} agent Agent name to retrieve
   * @returns {Promise<Agent>} A promise that resolves to the agent.
   */
  override async getAgent(project: string, agent: string): Promise<Agent> {
    const agentsUrl = this.getAgentsUrl(project) + `/${agent}`;
    try {
      const agentResponse = await this.client.get(agentsUrl);
      return Agent.fromJson(project, agentResponse.data, this);
    } catch (error) {
      throw MindsDbError.fromHttpError(error, agentsUrl);
    }
  }

  /**
   * Creates a new agent.
   *
   * @param {string} project Project name to which agent belongs to
   * @param {string} name Agent name to create
   * @param {string} [model] Model to use for the agent
   * @param {string} [provider] Provider to use for the agent
   * @param {Array<string>} [skills] Skills to assign to the agent
   * @param {any} [params] Additional parameters for the agent
   * @returns {Promise<Agent>} A promise that resolves to the created agent.
   */
  override async createAgent(
    project: string,
    name: string,
    model?: string,
    provider?: string,
    skills?: Array<string>,
    params?: any
  ): Promise<Agent> {
    const agentsUrl = this.getAgentsUrl(project);

    try {
      const agentsParams: any = params ? { ...params } : {};
      if (!agentsParams.hasOwnProperty('prompt_template')) {
        agentsParams['prompt_template'] = DEFAULT_LLM_PROMPT;
      }

      const agent: {
        name: string;
        model_name?: string;
        skills?: Array<string>;
        params?: any;
        provider?: string | null;
      } = {
        name: name,
        model_name: model || DEFAULT_LLM_MODEL,
        skills: skills || [],
        provider: provider || null,
        params: agentsParams,
      };

      const agentResponse = await this.client.post(agentsUrl, { agent });

      return Agent.fromJson(project, agentResponse.data, this);
    } catch (error) {
      throw MindsDbError.fromHttpError(error, agentsUrl);
    }
  }

  /**
   * Updates an existing agent.
   *
   * @param {string} project Project name to which agent belongs to
   * @param {string} agentName Name of the agent to update
   * @param {string} [updatedName] New name for the agent
   * @param {string} [updatedModel] New model for the agent
   * @param {Array<string>} [updatedSkills] New skills for the agent
   * @param {any} [updatedParams] New parameters for the agent
   * @returns {Promise<Agent>} A promise that resolves to the updated agent.
   */
  override async updateAgent(
    project: string,
    agentName: string,
    updatedName?: string,
    updatedModel?: string,
    updatedSkills?: Array<string>,
    updatedParams?: any
  ): Promise<Agent> {
    const agentsUrl = this.getAgentsUrl(project) + `/${agentName}`;
    try {
      const agent = await this.getAgent(project, agentName);
      const updatedSkillSet = new Set<string>();
      if (updatedSkills) {
        updatedSkills?.forEach((skill) => updatedSkillSet.add(skill));
      }
      const existingSkillSet = new Set<string>(agent.skills);
      const skillsToAddSet = new Set<string>(updatedSkillSet);
      existingSkillSet.forEach((skill) => {
        if (skillsToAddSet.has(skill)) {
          skillsToAddSet.delete(skill);
        }
      });
      const skillsToRemoveSet = new Set<string>(existingSkillSet);
      updatedSkillSet.forEach((skill) => {
        if (skillsToRemoveSet.has(skill)) {
          skillsToRemoveSet.delete(skill);
        }
      });

      const updatedAgent: {
        name: string;
        model_name: string;
        skills_to_add: Array<string>;
        skills_to_remove: Array<string>;
        params: any;
      } = {
        name: updatedName || agent.name,
        model_name: updatedModel || agent.model,
        skills_to_add: Array.from(skillsToAddSet),
        skills_to_remove: Array.from(skillsToRemoveSet),
        params: updatedParams || agent.params,
      };

      const agentResponse = await this.client.put(agentsUrl, {
        agent: updatedAgent,
      });

      return Agent.fromJson(project, agentResponse.data, this);
    } catch (error) {
      throw MindsDbError.fromHttpError(error, agentsUrl);
    }
  }

  /**
   * Deletes a specific agent by its name.
   *
   * @param {string} project Project name to which agent belongs to
   * @param {string} agent Agent name to delete
   */
  override async deleteAgent(project: string, agent: string): Promise<void> {
    const agentsUrl = this.getAgentsUrl(project) + `/${agent}`;
    try {
      await this.client.delete(agentsUrl);
    } catch (error) {
      throw MindsDbError.fromHttpError(error, agentsUrl);
    }
  }
}
