import type { APIRequestContext, APIResponse } from '@playwright/test';
import { API } from '../data/test-data';
import { admin } from '../data/users';

/**
 * Thin helper around a Playwright {@link APIRequestContext} for the WorkNest REST API.
 *
 * Every endpoint returns the envelope `{ success, data, error?, message? }`;
 * the auth token lives at `data.token`. This class centralises URL building and
 * bearer-header injection so the API specs stay focused on assertions.
 */
export class WorkNestAPI {
  constructor(private readonly ctx: APIRequestContext) {}

  /** POST /api/auth/login — returns the raw response for status/body assertions. */
  async login(email: string, password: string): Promise<APIResponse> {
    return this.ctx.post(API.login, { data: { email, password } });
  }

  /** Login and return just the JWT string from `data.token`. */
  async loginAndGetToken(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    const body = await response.json();
    return body.data.token as string;
  }

  /** Convenience: login as the admin fixture user and return the token. */
  async loginAdmin(): Promise<string> {
    return this.loginAndGetToken(admin.email, admin.password);
  }

  /** GET /api/auth/me — pass a token to authenticate, omit to test the 401 path. */
  async me(token?: string): Promise<APIResponse> {
    return this.ctx.get(API.me, token ? { headers: this.authHeader(token) } : {});
  }

  /** GET /api/employees?page=&limit= — requires a valid bearer token. */
  async employees(token: string, page = 1, limit = 8): Promise<APIResponse> {
    return this.ctx.get(`${API.employees}?page=${page}&limit=${limit}`, {
      headers: this.authHeader(token),
    });
  }

  private authHeader(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }
}
