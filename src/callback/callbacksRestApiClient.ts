import { Axios } from 'axios';
import CallbacksApiClient from './callbacksApiClient';
import { getBaseRequestConfig } from '../util/http';
import Constants from '../constants';
import Callback from './callback';
import HttpAuthenticator from '../httpAuthenticator';
import { MindsDbError } from '../errors';

/** Implementation of ProjectsApiClient that goes through the REST API. */
export default class CallbacksRestApiClient extends CallbacksApiClient {
  
  /** Axios client to send all HTTP requests. */
  client: Axios;

  /** Authenticator to use for reauthenticating if needed. */
  authenticator: HttpAuthenticator;

  /**
   * Constructor for Projects API client.
   * @param {Axios} client - Axios instance to send all HTTP requests.
   */
  constructor(client: Axios, authenticator: HttpAuthenticator) {
    super();
    this.client = client;
    this.authenticator = authenticator;
  }

  private getCallbacksUrl(): string {
    const baseUrl =
      this.client.defaults.baseURL || Constants.BASE_CLOUD_API_ENDPOINT;
    const projectsUrl = new URL(Constants.BASE_CALLBACK_URI, baseUrl);
    return projectsUrl.toString();
  }

  /**
   * Creates a new callback with the provided URL.
   * @param {string} url - The URL to be associated with the new callback.
   * @returns {Promise<Callback>} - A promise that resolves to the newly created callback.
   */
  async createCallback(url: string): Promise<Callback> {
    const callbacksUrl = this.getCallbacksUrl();
    const { authenticator, client } = this;
    try {
      const callbacksResponse = await client.post(
        callbacksUrl,
        {url},
        getBaseRequestConfig(authenticator)
      );
      if (!callbacksResponse.data) {
        return {} as Callback;
      }
      return callbacksResponse.data;
    } catch (error) {
      throw MindsDbError.fromHttpError(error, callbacksUrl);
    }
  }

  /**
   * Retrieves all callbacks associated with the current user.
   * @returns {Promise<Array<Callback>>} - A promise that resolves to an array of callbacks.
   */
  async getCallbacks(): Promise<Callback[]> {
    const callbacksUrl = this.getCallbacksUrl();
    const { authenticator, client } = this;
    try {
      const callbacksResponse = await client.get(
        callbacksUrl,
        getBaseRequestConfig(authenticator)
      );
      if (!callbacksResponse.data) {
        return [];
      }
      return callbacksResponse.data;
    } catch (error) {
      throw MindsDbError.fromHttpError(error, callbacksUrl);
    }
  }

  /**
   * Updates an existing callback with a new URL based on the provided ID.
   * @param {number} id - The ID of the callback to be updated.
   * @param {string} url - The new URL to update the callback with.
   * @returns {Promise<Callback>} - A promise that resolves to the updated callback.
   */
  async updateCallback(id: number, url: string): Promise<Callback> {
    const callbacksUrl = this.getCallbacksUrl();
    const { authenticator, client } = this;
    try {
      const callbacksResponse = await client.put(
        `${callbacksUrl}/${id}`,
        {url},
        getBaseRequestConfig(authenticator)
      );
      if (!callbacksResponse.data) {
        return {} as Callback;
      }
      return callbacksResponse.data;
    } catch (error) {
      throw MindsDbError.fromHttpError(error, callbacksUrl);
    }
  }

  /**
   * Deletes an existing callback based on the provided ID.
   * @param {number} id - The ID of the callback to be deleted.
   * @returns {Promise<void>} - A promise that resolves when the callback is successfully deleted.
   */
  async deleteCallback(id: number): Promise<void> {
    const callbacksUrl = this.getCallbacksUrl();
    const { authenticator, client } = this;
    try {
      const callbacksResponse = await client.delete(
        `${callbacksUrl}/${id}`,
        getBaseRequestConfig(authenticator)
      );
      return;
    } catch (error) {
      throw MindsDbError.fromHttpError(error, callbacksUrl);
    }
  }
}
