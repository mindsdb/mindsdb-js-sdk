import Constants from '../constants';
import { MindsDbError } from '../errors';
import AgentCompletion from './agentCompletion';
import AgentsRestApiClient from './agentsRestApiClient';

/**
 * Represents an agent in MindsDB.
 */
export default class Agent {
  /** Project name to which agent belongs to */
  project: string;

  /** Agent name */
  name: string;
  /** Model name */
  model: string;
  /** Skills of the agent */
  skills: Array<string>;
  /** Additional parameters */
  params: any;
  /** Rest API client to use for executing agent operations */
  agentsRestApiClient: AgentsRestApiClient;

  /**
   * Creates a new agent.
   *
   * @param {string} project - Project name to which agent belongs to
   * @param {string} name - Agent name
   * @param {string} model - Model name
   * @param {Array<string>} skills - Skills of the agent
   * @param {any} params - Additional parameters
   * @param {AgentsRestApiClient} agentsRestApiClient - Rest API client to use for executing agent operations
   */
  constructor(
    project: string,
    name: string,
    model: string,
    skills: Array<string>,
    params: any,
    agentsRestApiClient: AgentsRestApiClient
  ) {
    this.project = project;
    this.name = name;
    this.model = model;
    this.skills = skills;
    this.params = params;
    this.agentsRestApiClient = agentsRestApiClient;
  }

  /**
   * Creates an agent from a JSON object.
   *
   * @param {string} project - Project name to which agent belongs to
   * @param {any} json - JSON object representing the agent
   * @param {AgentsRestApiClient} agentsRestApiClient - Rest API client to use for executing agent operations
   * @returns {Agent} - The created agent
   */
  static fromJson(
    project: string,
    json: any,
    agentsRestApiClient: AgentsRestApiClient
  ): Agent {
    return new Agent(
      project,
      json.name,
      json.model,
      json.skills.map((skill: any) => skill.name),
      json.params || {},
      agentsRestApiClient
    );
  }

  /**
   * Gets the agent completion.
   *
   * @param {Array<any>} messages - Messages to send to the agent
   * @returns {Promise<AgentCompletion>} - The agent completion
   */
  async completion(messages: Array<any>): Promise<AgentCompletion> {
    const baseUrl =
      this.agentsRestApiClient.client.defaults.baseURL ||
      Constants.BASE_CLOUD_API_ENDPOINT;
    const agentsUrl = `${baseUrl}${Constants.BASE_PROJECTS_URI}/${this.project}/agents/${this.name}/completions`;

    try {
      const response = await this.agentsRestApiClient.client.post(agentsUrl, {
        messages: messages,
      });

      const content: string = response.data.message.content;
      const context: Array<string> = response.data.message.context || [];
      return new AgentCompletion(content, context);
    } catch (error) {
      throw MindsDbError.fromHttpError(error, agentsUrl);
    }
  }
}
