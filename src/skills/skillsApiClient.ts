import Skill, { SkillParams } from './skill';

/**
 * An abstract class representing the API client for managing skills.
 * This class provides methods to interact with skills in a specific project.
 */
export default abstract class SkillsApiClient {
  /**
   * Retrieves all skills associated with a given project.
   * @param project - The name of the project.
   * @returns A promise that resolves to an array of skills.
   */
  abstract getAllSkills(project: string): Promise<Array<Skill>>;

  /**
   * Retrieves a specific skill by name within a given project.
   * @param name - The name of the skill.
   * @param project - The name of the project.
   * @returns A promise that resolves to the skill.
   */
  abstract getSkill(name: string, project: string): Promise<Skill>;

  /**
   * Creates a new skill within a given project.
   * @param name - The name of the skill.
   * @param type - The type of the skill.
   * @param project - The name of the project.
   * @param params - The parameters for the skill.
   * @returns A promise that resolves to the created skill.
   */
  abstract createSkill(
    name: string,
    type: string,
    project: string,
    params: SkillParams
  ): Promise<Skill>;

  /**
   * Updates an existing skill within a given project.
   * @param name - The name of the skill.
   * @param project - The name of the project.
   * @param updatedSkill - The updated skill object.
   * @returns A promise that resolves to the updated skill.
   */
  abstract updateSkill(
    name: string,
    project: string,
    updatedSkill: Skill
  ): Promise<Skill>;

  /**
   * Deletes a specific skill by name within a given project.
   * @param name - The name of the skill.
   * @param project - The name of the project.
   * @returns A promise that resolves when the skill is deleted.
   */
  abstract deleteSkill(name: string, project: string): Promise<void>;
}
