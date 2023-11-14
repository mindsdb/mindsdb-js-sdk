import Callback from './callback';

/** Abstract class outlining Project operations supported by the SDK. */
export default abstract class CallbacksApiClient {
  /**
   * Creates a new callback with the provided URL.
   * @param {string} url - The URL to be associated with the new callback.
   * @returns {Promise<Callback>} - A promise that resolves to the newly created callback.
   */
  abstract createCallback(url: string): Promise<Callback>;

  /**
   * Retrieves all callbacks associated with the current user.
   * @returns {Promise<Array<Callback>>} - A promise that resolves to an array of callbacks.
   */
  abstract getCallbacks(): Promise<Array<Callback>>;

  /**
   * Updates an existing callback with a new URL based on the provided ID.
   * @param {number} id - The ID of the callback to be updated.
   * @param {string} url - The new URL to update the callback with.
   * @returns {Promise<Callback>} - A promise that resolves to the updated callback.
   */
  abstract updateCallback(id: number, url: string): Promise<Callback>;

  /**
   * Deletes an existing callback based on the provided ID.
   * @param {number} id - The ID of the callback to be deleted.
   * @returns {Promise<void>} - A promise that resolves when the callback is successfully deleted.
   */
  abstract deleteCallback(id: number): Promise<void>;
}