import type { LeaveFormData } from '../types';

/** Base URL of the target WorkNest deployment (overridable via BASE_URL env). */
export const BASE_URL = process.env.BASE_URL ?? 'https://worknest-site.netlify.app';

/** localStorage keys WorkNest uses to persist the JWT session. */
export const STORAGE_KEYS = {
  token: 'worknest_token',
  user: 'worknest_user',
} as const;

/** WorkNest REST endpoints exercised by the API tests. */
export const API = {
  login: '/api/auth/login',
  me: '/api/auth/me',
  employees: '/api/employees',
  leave: '/api/leave',
  tasks: '/api/tasks',
} as const;

/** Expected Kanban columns, in board order. */
export const KANBAN_COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'] as const;

/** The four leave-balance categories rendered in the UI. */
export const LEAVE_BALANCE_TYPES = ['Annual', 'Sick', 'Personal', 'Remote'] as const;

/** Default page size for the employee directory (server default). */
export const EMPLOYEE_PAGE_LIMIT = 8;

/**
 * Timeout for waits that depend on WorkNest fetching data client-side. The live
 * Netlify app can be slow to respond when the whole suite hammers it in parallel,
 * so these first-paint waits use a generous window while per-assertion checks
 * keep the strict global expect timeout (5s).
 */
export const LOAD_TIMEOUT = 15_000;

/**
 * Sample leave request. Uses dates far in the future so the request is always
 * valid regardless of when the suite runs.
 */
export const SAMPLE_LEAVE: LeaveFormData = {
  type: 'annual',
  start: '2026-12-01',
  end: '2026-12-03',
  reason: 'Automated E2E test — annual leave request',
};
