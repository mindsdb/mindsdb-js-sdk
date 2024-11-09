/**
 * Represents the completion of an agent with content and context.
 */
export default class AgentCompletion {
  /**
   * The content of the agent completion.
   */
  content: string;

  /**
   * The context in which the agent completion is made.
   */
  context: Array<string>;

  /**
   * Creates an instance of AgentCompletion.
   * @param {string} content - The content of the agent completion.
   * @param {Array<string>} context - The context in which the agent completion is made.
   */
  constructor(content: string, context: Array<string>) {
    this.content = content;
    this.context = context;
  }
}
