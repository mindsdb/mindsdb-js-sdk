/**
 * Parameters for SQL skills.
 *
 * @property {string} database - The name of the database.
 * @property {string[]} tables - The list of tables.
 * @property {string} [description] - Optional description of the skill.
 */
export interface SQLSkillParams {
  database: string;
  tables: string[];
  description?: string;
}

/**
 * Parameters for Retrieval skills.
 *
 * @property {string} source - The source of the data.
 * @property {string} [description] - Optional description of the skill.
 */
export interface RetrievalSkillParams {
  source: string;
  description?: string;
}

/**
 * Union type for skill parameters.
 */
export type SkillParams = SQLSkillParams | RetrievalSkillParams;

/**
 * Represents a generic skill.
 *
 * @property {string} name - The name of the skill.
 * @property {string} type - The type of the skill.
 * @property {string} project - The project associated with the skill.
 * @property {SkillParams} params - The parameters of the skill.
 */
export default class Skill {
  name: string;
  type: string;
  project: string;
  params: SkillParams;

  /**
   * Creates an instance of Skill.
   *
   * @param {string} name - The name of the skill.
   * @param {string} type - The type of the skill.
   * @param {string} project - The project associated with the skill.
   * @param {SkillParams} params - The parameters of the skill.
   */
  constructor(
    name: string,
    type: string,
    project: string,
    params: SkillParams
  ) {
    this.name = name;
    this.type = type;
    this.project = project;
    this.params = params;
  }

  /**
   * Creates a Skill instance from a JSON object.
   *
   * @param {string} project - The project associated with the skill.
   * @param {any} json - The JSON object containing skill data.
   * @returns {Skill} The created Skill instance.
   */
  static fromJson(project: string, json: any): Skill {
    const { name, type, params } = json;
    if (type === 'sql') {
      return new SQLSkill(
        name,
        params.tables,
        params.database,
        params.description
      );
    } else if (type === 'retrieval') {
      return new RetrievalSkill(name, params.source, params.description);
    }
    return new Skill(name, type, project, params);
  }

  /**
   * Checks if this skill is equal to another skill.
   *
   * @param {Skill} other - The other skill to compare with.
   * @returns {boolean} True if the skills are equal, false otherwise.
   */
  equals(other: Skill): boolean {
    return (
      this.name === other.name &&
      this.type === other.type &&
      JSON.stringify(this.params) === JSON.stringify(other.params)
    );
  }

  /**
   * Returns a string representation of the skill.
   *
   * @returns {string} The string representation of the skill.
   */
  toString(): string {
    return `${this.constructor.name}(name: ${this.name})`;
  }
}

/**
 * Represents a SQL skill.
 */
export class SQLSkill extends Skill {
  /**
   * Creates an instance of SQLSkill.
   *
   * @param {string} name - The name of the skill.
   * @param {string[]} tables - The list of tables.
   * @param {string} database - The name of the database.
   * @param {string} project - The project associated with the skill.
   * @param {string} [description] - Optional description of the skill.
   */
  constructor(
    name: string,
    tables: string[],
    database: string,
    project: string,
    description?: string
  ) {
    const params: SQLSkillParams = { database, tables, description };
    super(name, 'sql', project, params);
  }
}

/**
 * Represents a Retrieval skill.
 */
export class RetrievalSkill extends Skill {
  /**
   * Creates an instance of RetrievalSkill.
   *
   * @param {string} name - The name of the skill.
   * @param {string} project - The project associated with the skill.
   * @param {string} source - The source of the data.
   * @param {string} [description] - Optional description of the skill.
   */
  constructor(
    name: string,
    project: string,
    source: string,
    description?: string
  ) {
    const params: RetrievalSkillParams = { source, description };
    super(name, 'retrieval', project, params);
  }
}
