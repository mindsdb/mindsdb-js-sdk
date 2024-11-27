import SqlQueryResult from '../sql/sqlQueryResult';
import KnowledgeBase from './knowledge_base';

/** Abstract class outlining Knowledge Base API operations supported by the SDK. */
export default abstract class KnowledgeBaseApiClient {
  /**
   * Gets all knowledge bases for a project.
   *
   * @param {string} project  - Project name in which knowledge base belongs
   */
  abstract getAllKnowledgeBase(project: string): Promise<Array<KnowledgeBase>>;

  /**
   * Gets a knowledge base by name for a project.
   *
   * @param {string} name  - Name of the knowledge base
   * @param {string} project - Project name in which knowledge base belongs
   */
  abstract getKnowledgeBase(
    name: string,
    project: string
  ): Promise<KnowledgeBase>;

  /**
   * Creates a knowledge base with the given name, project, model, storage, metadataColumns, contentColumns, idColumn, and params.
   *
   * @param {string} name - Name of the knowledge base to be created
   * @param {string} project - Project name in which knowledge base belongs
   * @param {string} model - Name of the embedding model used (optional)
   * @param {string} storage - Name of the storage used (optional)
   * @param {Array<string>} metadataColumns - Metadata columns name (optional)
   * @param {Array<string>} contentColumns - Content column names (default content) (optional)
   * @param {string} idColumn - ID column name (optional)
   * @param {unknown} params - Params for knowledge base in JSON Object (optional)
   */
  abstract createKnowledgeBase(
    name: string,
    project: string,
    model?: string,
    storage?: string,
    metadataColumns?: Array<string>,
    contentColumns?: Array<string>,
    idColumn?: string,
    params?: unknown
  ): Promise<KnowledgeBase>;

  /**
   * Deletes a knowledge base by name for a project.
   *
   * @param {string} name - Name of the knowledge base to be deleted
   * @param {string} project - Project name in which knowledge base belongs
   */
  abstract deleteKnowledgeBase(name: string, project: string): Promise<void>;

  /**
   * Inserts webpages into a knowledge base.
   *
   * @param {string} project - Project name in which knowledge base belongs
   * @param {string} knowledgeBaseName - Name of the knowledge base
   * @param {Array<string>} urls - List of URLs to be inserted
   * @param {number} crawlDepth - Depth of the crawl
   * @param {Array<string> | null} filters - Filters to be applied during the crawl (optional)
   */
  abstract insertWebpagesIntoKnowledgeBase(
    project: string,
    knowledgeBaseName: string,
    urls: Array<string>,
    crawlDepth: number,
    filters: Array<string> | null
  ): Promise<void>;

  /**
   * Inserts data into a knowledge base using an SQL query.
   *
   * @param {string} sqlQuery - The SQL query to insert data into the knowledge base
   */
  abstract insertDataIntoKnowledgeBase(sqlQuery: string): Promise<void>;

  /**
   * Fetches data from a knowledge base using an SQL query.
   *
   * @param {string} sqlQuery - The SQL query to fetch data from the knowledge base
   */
  abstract fetch(sqlQuery: string): Promise<SqlQueryResult>;
}
