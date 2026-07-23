/** Shared domain & API types for the WorkNest test suite. */

export type Role = 'admin' | 'manager' | 'employee';

export type LeaveType = 'annual' | 'sick' | 'personal' | 'remote';

/** A row from `src/data/users.json`, used by auth.setup and the data-driven test. */
export interface UserCredential {
  role: Role;
  email: string;
  password: string;
  expectedRoute: string;
}

/** The user object returned inside the API envelope's `data.user`. */
export interface WorkNestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  position: string;
  phone?: string;
  avatar?: string;
  joinDate?: string;
  status?: string;
}

/**
 * Every WorkNest API responds with this envelope.
 * Token lives at `data.token`; the user object at `data.user`; lists at `data` (array).
 */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface LoginPayload {
  user: WorkNestUser;
  token: string;
}

/** Input for the Leave "New Request" modal form. */
export interface LeaveFormData {
  type: LeaveType;
  start: string;
  end: string;
  reason: string;
}
