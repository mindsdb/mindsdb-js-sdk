import Agent from './agent';

/**
 * Abstract class representing the API client for managing agents.
 */
export default abstract class AgentsApiClient {
  /**
   * Retrieves all agents for a given project.
   * @param {string} project - The name of the project.
   * @throws {MindsDbError} If the agents cannot be retrieved.
   * @returns {Promise<Array<Agent>>} A promise that resolves to an array of agents.
   */
  abstract getAllAgents(project: string): Promise<Array<Agent>>;

  /**
   * Retrieves a specific agent by its ID.
   * @param {string} project - The name of the project.
   * @param {string} agentId - The ID of the agent.
   * @throws {MindsDbError} If the agent does not exist.
   * @returns {Promise<Agent>} A promise that resolves to the agent.
   */
  abstract getAgent(project: string, agentId: string): Promise<Agent>;

  /**
   * Creates a new agent.
   * @param {string} project - The name of the project.
   * @param {string} name - The name of the agent.
   * @param {string} model - The model of the agent.
   * @param {string} provider - The provider of the agent.
   * @param {Array<string>} skills - An array of skills for the agent.
   * @param {any} [params] - Optional parameters for the agent.
   * @throws {MindsDbError} If the agent cannot be created.
   * @returns {Promise<Agent>} A promise that resolves to the created agent.
   */
  abstract createAgent(
    project: string,
    name: string,
    model: string,
    provider: string,
    skills: Array<string>,
    params?: any
  ): Promise<Agent>;

  /**
   * Updates an existing agent.
   * @param {string} project - The name of the project.
   * @param {string} agentName - The current name of the agent.
   * @param {string} [updatedName] - The new name of the agent (optional).
   * @param {string} [updatedModel] - The new model of the agent (optional).
   * @param {Array<string>} [updatedSkills] - An array of updated skills for the agent (optional).
   * @param {any} [updatedParams] - Optional updated parameters for the agent.
   * @throws {MindsDbError} If the agent cannot be updated.
   * @returns {Promise<Agent>} A promise that resolves to the updated agent.
   */
  abstract updateAgent(
    project: string,
    agentName: string,
    updatedName?: string,
    updatedModel?: string,
    updatedSkills?: Array<string>,
    updatedParams?: any
  ): Promise<Agent>;

  /**
   * Deletes an agent.
   * @param {string} project - The name of the project.
   * @param {string} agent - The name of the agent to delete.
   * @throws {MindsDbError} If the agent cannot be deleted.
   * @returns {Promise<void>} A promise that resolves when the agent is deleted.
   */
  abstract deleteAgent(project: string, agent: string): Promise<void>;
}
