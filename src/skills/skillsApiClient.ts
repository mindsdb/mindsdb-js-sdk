import Skill, { SkillParams } from './skill';

export default abstract class SkillsApiClient {
  abstract getAllSkills(): Promise<Array<Skill>>;
  abstract getSkill(name: string): Promise<Skill>;
  abstract createSkill(
    name: string,
    type: string,
    params: SkillParams
  ): Promise<Skill>;
  abstract updateSkill(name: string, updatedSkill: Skill): Promise<Skill>;
  abstract deleteSkill(name: string): Promise<void>;
}
