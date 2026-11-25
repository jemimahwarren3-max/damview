/**
 * Performance timing utility for measuring query and page load times.
 * All logging is suppressed in production to avoid I/O overhead.
 */

const isDev = process.env.NODE_ENV !== "production";

export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number>;

  constructor(private label: string) {
    this.startTime = performance.now();
    this.marks = new Map();
  }

  mark(label: string) {
    this.marks.set(label, performance.now());
  }

  getElapsed(fromMark?: string): number {
    const now = performance.now();
    const start = fromMark ? this.marks.get(fromMark) || this.startTime : this.startTime;
    return now - start;
  }

  log(message?: string) {
    if (!isDev) return;
    const elapsed = this.getElapsed();
    console.log(`[PERF] ${this.label}${message ? ` - ${message}` : ''}: ${elapsed.toFixed(2)}ms`);
  }

  logMark(markLabel: string, message?: string) {
    if (!isDev) return;
    const markTime = this.marks.get(markLabel);
    if (!markTime) {
      console.warn(`[PERF] Mark "${markLabel}" not found`);
      return;
    }
    const elapsed = markTime - this.startTime;
    console.log(`[PERF] ${this.label} - ${markLabel}${message ? ` - ${message}` : ''}: ${elapsed.toFixed(2)}ms`);
  }

  end() {
    const elapsed = this.getElapsed();
    if (isDev) {
      console.log(`[PERF] ${this.label} - TOTAL: ${elapsed.toFixed(2)}ms`);
    }
    return elapsed;
  }
}

export function createTimer(label: string) {
  return new PerformanceTimer(label);
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  if (isDev) {
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }
  return { result, duration };
}

/**
 * Measure Supabase query execution time
 */
export async function measureQuery<T>(
  queryName: string,
  queryPromise: Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await queryPromise;
  const duration = performance.now() - start;
  if (isDev) {
    console.log(`[PERF] Query: ${queryName} - ${duration.toFixed(2)}ms`);
  }
  return result;
}
