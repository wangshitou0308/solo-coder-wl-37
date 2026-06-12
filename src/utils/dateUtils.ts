export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const diffTime = e.getTime() - s.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysOverdue(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  const diff = getDaysBetween(deadlineDate, today);
  return diff > 0 ? diff : 0;
}

export function addDays(date: string | Date, days: number): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getAge(buildYear: number): number {
  return new Date().getFullYear() - buildYear;
}

export function getAgeRange(buildYear: number): string {
  const age = getAge(buildYear);
  if (age < 10) return '0-10年';
  if (age < 20) return '10-20年';
  if (age < 30) return '20-30年';
  if (age < 40) return '30-40年';
  if (age < 50) return '40-50年';
  return '50年以上';
}

export function isDateExpired(date: string): boolean {
  return getDaysOverdue(date) > 0;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}
