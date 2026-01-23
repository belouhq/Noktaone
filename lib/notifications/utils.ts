/**
 * Notification Utilities
 */

/**
 * Interpolate template variables in a string
 * @param template Template string with {{variable}} placeholders
 * @param variables Object with variable values
 * @returns Interpolated string
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : match;
  });
}
