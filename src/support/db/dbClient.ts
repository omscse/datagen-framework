type DbExecutor = (sql: string, params?: unknown[]) => Promise<unknown[]>;

let executor: DbExecutor | undefined;

export function setDbExecutor(fn: DbExecutor): void {
  executor = fn;
}

export async function executeQuery<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
  if (!executor) {
    throw new Error(
      'No database executor configured. Call setDbExecutor() with your DB client before using executeQuery().',
    );
  }
  const rows = await executor(sql, params);
  return rows as T[];
}
