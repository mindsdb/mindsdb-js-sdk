import MLEngine from './ml_engine';
import { Readable } from 'stream';

/**
 * Abstract class outlining MLEngine API operations supported by the SDK.
 */
export default abstract class MLEnginesApiClient {
  /**
   * Gets all mlEngines for the authenticated user.
   * @returns {Promise<Array<MLEngine>>} - All mlEngines for the user.
   */
  abstract getAllMLEngines(): Promise<Array<MLEngine>>;

  /**
   * Gets a mlEngine by name for the authenticated user.
   * @param {string} name - Name of the mlEngine.
   * @returns {Promise<MLEngine | undefined>} - Matching mlEngine, or undefined if it doesn't exist.
   */
  abstract getMLEngine(name: string): Promise<MLEngine | undefined>;

  /**
   * Creates a mlEngine with the given name, engine, and parameters.
   * @param {string} name - Name of the mlEngine to be created.
   * @param {string | Readable} [codeFilePath] - Path to the code file or Readable of to be used for the mlEngine.
   * @param {string | Readable} [modulesFilePath] - Path to the modules file or Readable of to be used for the mlEngine.
   *  @param {string} [type] - Type of the mlEngine to be created.
   * @returns {Promise<MLEngine>} - Newly created mlEngine.
   * @throws {MindsDbError} - Something went wrong creating the mlEngine.
   */
  abstract createMLEngine(
    name: string,
    codeFilePath: string | Readable,
    modulesFilePath: string | Readable,
    type: 'venv' | 'inhouse'
  ): Promise<MLEngine | undefined>;

  /**
   * Updates a mlEngine with the given name, engine, and parameters.
   * @param {string} name - Name of the mlEngine to be created.
   * @param {string | Readable} [codeFilePath] - Path to the code file to be used for the mlEngine.
   * @param {string | Readable} [modulesFilePath] - Path to the modules file to be used for the mlEngine.
   * @param {string} [type] - Type of the mlEngine to be created.
   * @returns {Promise<MLEngine>} - Newly created mlEngine.
   * @throws {MindsDbError} - Something went wrong creating the mlEngine.
   */
  abstract updateMLEngine(
    name: string,
    codeFilePath: string | Readable,
    modulesFilePath: string | Readable,
    type: 'venv' | 'inhouse'
  ): Promise<MLEngine | undefined>;

  /**
   * Deletes a mlEngine by name.
   * @param {string} name - Name of the mlEngine to be deleted.
   * @throws {MindsDbError} - Something went wrong deleting the mlEngine.
   */
  abstract deleteMLEngine(name: string): Promise<void>;
}
