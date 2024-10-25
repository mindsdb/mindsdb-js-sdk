export interface SQLSkillParams {
  database: string;
  tables: string[];
  description?: string;
}

export interface RetrievalSkillParams {
  source: string;
  description?: string;
}

export type SkillParams = SQLSkillParams | RetrievalSkillParams;

export default class Skill {
  name: string;
  type: string;
  params: SkillParams;

  constructor(name: string, type: string, params: SkillParams) {
    this.name = name;
    this.type = type;
    this.params = params;
  }

  static fromJson(json: any): Skill {
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
    return new Skill(name, type, params);
  }

  equals(other: Skill): boolean {
    return (
      this.name === other.name &&
      this.type === other.type &&
      JSON.stringify(this.params) === JSON.stringify(other.params)
    );
  }

  toString(): string {
    return `${this.constructor.name}(name: ${this.name})`;
  }
}

export class SQLSkill extends Skill {
  constructor(
    name: string,
    tables: string[],
    database: string,
    description?: string
  ) {
    const params: SQLSkillParams = { database, tables, description };
    super(name, 'sql', params);
  }
}

export class RetrievalSkill extends Skill {
  constructor(name: string, source: string, description?: string) {
    const params: RetrievalSkillParams = { source, description };
    super(name, 'retrieval', params);
  }
}
