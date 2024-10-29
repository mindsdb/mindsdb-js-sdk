import Skill, { SkillParams } from './skill';

export default abstract class SkillsApiClient {
  abstract getAllSkills(project: string): Promise<Array<Skill>>;

  abstract getSkill(name: string, project: string): Promise<Skill>;
  abstract createSkill(
    name: string,
    type: string,
    project: string,
    params: SkillParams
  ): Promise<Skill>;
  abstract updateSkill(
    name: string,
    project: string,
    updatedSkill: Skill
  ): Promise<Skill>;
  abstract deleteSkill(name: string, project: string): Promise<void>;
}
