import { label, severity, tag } from 'allure-js-commons';

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

interface AllureMeta {
  /** Business module the test belongs to (AUTH, DASH, EMP, LEAVE, TASK, API, VISUAL). */
  module: string;
  severity?: Severity;
  /** Behaviour tags such as 'smoke' | 'regression'. */
  tags?: string[];
}

/**
 * Attach Allure labels/tags to the current test. Call once at the top of a test.
 * `module` + `severity` power Allure's grouping; tags feed the "Behaviors"/filter views.
 */
export async function annotate(meta: AllureMeta): Promise<void> {
  await label('module', meta.module);
  if (meta.severity) {
    await severity(meta.severity);
  }
  for (const t of meta.tags ?? []) {
    await tag(t);
  }
}
