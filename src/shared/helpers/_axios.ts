import axios from 'axios';
import { IAxiosHelperResponse } from '../interfaces';
import configuration from 'src/libs/configuration';

const config = configuration();

export class AxiosHelper {
  /**
   * helps send a post request with the help of axios
   * @param  {Record<string, unknown>} path
   * @param  {any} data
   * @param  {Record<string, unknown>} headers
   */
  static async sendPostRequest(
    data,
    path: string,
    headers: Record<string, unknown> | null = null,
    timeout: number = config.app.serviceTimeout,
  ): Promise<IAxiosHelperResponse> {
    const response = await axios.post(path, data, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout,
    });

    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * helps send a get request with the help of axios
   * @param  {Record<string, unknown>} path
   * @param  {Record<string, unknown>} headers
   */
  static async sendGetRequest(
    path: string,
    headers: Record<string, unknown> | null = null,
  ): Promise<IAxiosHelperResponse> {
    const response = await axios.get(path, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    return {
      data: response.data,
      status: response.status,
    };
  }
}
