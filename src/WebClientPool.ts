import { WebClient, WebClientOptions } from '@slack/web-api';

export default class WebClientPool {
  private pool: { [token: string]: WebClient; } = {};

  public getOrCreate(token: string, clientOptions: WebClientOptions): WebClient {
    const cachedClient = this.pool[token];
    if (typeof cachedClient !== 'undefined') {
      return cachedClient;
    }
    const client = new WebClient(token, clientOptions);
    this.pool[token] = client;
    return client;
  }
}
