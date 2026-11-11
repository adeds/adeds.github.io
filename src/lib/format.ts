const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2020-03" -> "Mar 2020" */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "2020-03", null -> "Mar 2020 – Present" */
export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`;
}

/** "2022-01-19" -> "Jan 2022" */
export function formatDate(iso: string): string {
  return formatMonth(iso.slice(0, 7));
}

/** Months between two "YYYY-MM" values (end defaults to the build month). */
export function monthsBetween(start: string, end?: string | null): number {
  const [sy, sm] = start.split('-').map(Number);
  const now = new Date();
  const [ey, em] = end ? end.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  return (ey - sy) * 12 + (em - sm);
}
