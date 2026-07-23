import usersJson from './users.json';
import type { Role, UserCredential } from '../types';

/** All three role credentials, loaded from the committed JSON fixture. */
export const users: UserCredential[] = usersJson as UserCredential[];

/** Look up a single role's credentials (used by auth.setup and E2E specs). */
export function getUser(role: Role): UserCredential {
  const user = users.find((u) => u.role === role);
  if (!user) {
    throw new Error(`No credentials found for role "${role}" in users.json`);
  }
  return user;
}

export const admin = getUser('admin');
export const manager = getUser('manager');
export const employee = getUser('employee');
