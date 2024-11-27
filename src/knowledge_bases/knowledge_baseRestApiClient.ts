import { Axios } from 'axios';
import Constants from '../constants';
import SqlApiClient from '../sql/sqlApiClient';
import SqlQueryResult from '../sql/sqlQueryResult';
import KnowledgeBase, { KnowledgeBaseParams } from './knowledge_base';
import KnowledgeBaseApiClient from './knowledge_baseApiClient';

/** Implementation of KnowledgeBaseApiClient that goes through the REST API */
export default class KnowledgeBaseRestApiClient extends KnowledgeBaseApiClient {
  /** SQL API client to send all SQL Queries */
  sqlClient: SqlApiClient;
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /**
   * Constructor for KnowledgeBaseRestApiClient
   *
   * @param {SqlApiClient} sqlClient - SQL API client to send all SQL query requests.
   * @param {Axios} client - Axios client to send all HTTP requests.
   */
  constructor(sqlClient: SqlApiClient, client: Axios) {
    super();
    this.sqlClient = sqlClient;
    this.client = client;
  }

  // Private method to list knowledge bases
  private async listKnowledgeBase(name?: string): Promise<KnowledgeBase[]> {
    let astQuery = `SELECT * FROM information_schema.knowledge_bases`;
    if (name) {
      astQuery += ` WHERE name = '${name}'`;
    }
    astQuery += ';';

    const response = await this.sqlClient.runQuery(astQuery);
    return response.rows.map(
      (row) => new KnowledgeBase(this, row.project, row as {
        name: string;
        storage: string | null;
        model: string | null;
        params: KnowledgeBaseParams | string;
      })
    );
  }

  /**
   * Gets all knowledge bases.
   *
   * @returns {Promise<Array<KnowledgeBase>>} - List of all knowledge bases
   */
  override async getAllKnowledgeBase(): Promise<KnowledgeBase[]> {
    return this.listKnowledgeBase();
  }

  /**
   * Gets a knowledge base by name.
   *
   * @param {string} name - Name of the knowledge base
   * @returns {Promise<KnowledgeBase>} - Knowledge base with the given name
   */
  override async getKnowledgeBase(name: string): Promise<KnowledgeBase> {
    const kb = await this.listKnowledgeBase(name);
    if (kb.length === 0) {
      throw new Error(`Knowledge base ${name} not found`);
    }
    return kb[0];
  }

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
  override async createKnowledgeBase(
    name: string,
    project: string,
    model?: string,
    storage?: string,
    metadataColumns?: string[],
    contentColumns?: string[],
    idColumn?: string,
    params?: unknown
  ): Promise<KnowledgeBase> {
    let paramsOut: { [key: string]: unknown } = {};
    if (metadataColumns) {
      paramsOut['metadata_columns'] = metadataColumns;
    }
    if (contentColumns) {
      paramsOut['content_columns'] = contentColumns;
    }
    if (idColumn) {
      paramsOut['id_column'] = idColumn;
    }
    if (params) {
      paramsOut = { ...paramsOut, ...params };
    }
    const modelName = model ? project + '.' + model : null;
    const storageName = storage ? storage : null;

    let astQuery = `CREATE KNOWLEDGE BASE ${project}.${name}`;
    if (modelName || storageName || Object.keys(paramsOut).length > 0) {
      astQuery += ' USING ';
      if (modelName) {
        astQuery += `MODEL = ${modelName}`;
      }
      if (storageName) {
        astQuery += ` STORAGE = ${storageName}`;
      }
      if (Object.keys(paramsOut).length > 0) {
        astQuery += ` PARAMS = ${JSON.stringify(paramsOut)}`;
      }
    }

    astQuery += ';';
    const response = await this.sqlClient.runQuery(astQuery);
    if (response.type === 'error') {
      throw new Error(response.error_message);
    }
    const kb = await this.getKnowledgeBase(name.toLowerCase());
    return kb;
  }

  /**
   * Deletes a knowledge base by name for a project.
   *
   * @param {string} name - Name of the knowledge base to be deleted
   * @param {string} project - Project name in which knowledge base belongs
   */
  override async deleteKnowledgeBase(
    name: string,
    project: string
  ): Promise<void> {
    const astQuery = `DROP KNOWLEDGE BASE ${project}.${name};`;
    const response = await this.sqlClient.runQuery(astQuery);
    if (response.type === 'error') {
      throw new Error(response.error_message);
    }
  }

  /**
   * Inserts webpages into a knowledge base.
   *
   * @param {string} project - Project name in which knowledge base belongs
   * @param {string} knowledgeBaseName - Name of the knowledge base
   * @param {Array<string>} urls - List of URLs to be inserted
   * @param {number} crawlDepth - Depth of the crawl
   * @param {Array<string> | null} filters - Filters to be applied during the crawl (optional)
   */
  override async insertWebpagesIntoKnowledgeBase(
    project: string,
    knowledgeBaseName: string,
    urls: Array<string>,
    crawlDepth: number,
    filters: Array<string> | null
  ): Promise<void> {
    const payload = {
      knowledge_base: {
        urls: urls,
        crawl_depth: crawlDepth,
        filters: filters ? filters : [],
      },
    };

    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const kbUrl = `${baseUrl}/api/projects/${project}/knowledge_bases/${knowledgeBaseName}`;

    const response = await this.client.put(kbUrl, payload);
  }

  /**
   * Inserts data into a knowledge base using an SQL query.
   *
   * @param {string} sqlQuery - The SQL query to insert data into the knowledge base
   */
  override async insertDataIntoKnowledgeBase(sqlQuery: string): Promise<void> {
    await this.sqlClient.runQuery(sqlQuery);
  }

  /**
   * Fetches data from a knowledge base using an SQL query.
   *
   * @param {string} sqlQuery - The SQL query to fetch data from the knowledge base
   */
  async fetch(sqlQuery: string): Promise<SqlQueryResult> {
    return await this.sqlClient.runQuery(sqlQuery);
  }

  // TODO: Implement file insert to knowledgebase
}
