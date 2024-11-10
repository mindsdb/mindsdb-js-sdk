import MLEngineApiClient from './ml_enginesApiClient';
import { Readable } from 'stream';

/**
 * Represents a MindsDB mlEngine and all supported operations.
 */
export default class MLEngine {
  /** API client to use for executing mlEngine operations. */
  mlEnginesApiClient: MLEngineApiClient;

  /** Name of the mlEngine. */
  name: string;

  /** Type of the mlEngine (e.g. project, data). */
  handler: string;

  /** Engine used to create the mlEngine (e.g. postgres). */
  connection_data?: any;

  /**
   *
   * @param {MLEngineApiClient} mlEnginesApiClient - API client to use for executing mlEngine operations.
   * @param {string} name - Name of the mlEngine.
   * @param {string} type - Type of the mlEngine (e.g. project, data).
   * @param {string} connection_data - Engine used to create the mlEngine (e.g. postgres).
   */
  constructor(
    mlEnginesApiClient: MLEngineApiClient,
    name: string,
    handler: string,
    connection_data: string | undefined
  ) {
    this.mlEnginesApiClient = mlEnginesApiClient;
    this.name = name;
    this.handler = handler;
    this.connection_data = connection_data;
  }

  /**
   * Creates a mlEngine with the given name, engine, and parameters.
   * @param {string | Readable} [codeFilePath] - Path to the code file or Readable of to be used for the mlEngine.
   * @param {string | Readable} [modulesFilePath] - Path to the modules file or Readable of to be used for the mlEngine.
   * @param {string} [type] - Type of the mlEngine to be created.
   * @returns {Promise<MLEngine>} - Newly created mlEngine.
   * @throws {MindsDbError} - Something went wrong creating the mlEngine.
   */
  async configure(codeFilePath:string | Readable,modulesFilePath:string | Readable,type:'venv' | 'inhouse'): Promise<void> {
    await this.mlEnginesApiClient.createMLEngine(this.name,codeFilePath,modulesFilePath,type);
  }
  

    /**
   * Removes a specified mlEngine by its name.
   * @param {string} mlEngineName - The name of the mlEngine to remove.
   * @returns {Promise<void>} - Resolves when the mlEngine is successfully removed.
   * @throws {MindsDbError} - Something went wrong deleting the mlEngine.
   */
  async remove(mlEngineName: string): Promise<void> {
    await this.mlEnginesApiClient.deleteMLEngine(mlEngineName);
  }


  /** Deletes this mlEngine.
   *  @throws {MindsDbError} - Something went wrong deleting the mlEngine.
   */
  async delete(): Promise<void> {
    await this.mlEnginesApiClient.deleteMLEngine(this.name);
  }
}
