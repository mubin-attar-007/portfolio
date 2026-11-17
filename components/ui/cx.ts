/**
 * cx — joins class names, skipping the falsy ones, so a conditional class reads
 * as `cx(styles.menu, open && styles.open)` instead of a template literal with
 * stray spaces.
 *
 * @param parts class names; `false`, `null`, `undefined` and `""` are dropped.
 * @returns the space-separated class string.
 */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
