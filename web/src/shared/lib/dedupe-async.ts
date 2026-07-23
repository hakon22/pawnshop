const inflight = new Map<string, Promise<unknown>>();

/**
 * Дедупликация параллельных вызовов с одним ключом в StrictMode
 * Параллельные вызовы с одним ключом делят один Promise (один HTTP-запрос).
 * После завершения ключ снимается.
 */
export const dedupeAsync = <T>(key: string, run: () => Promise<T>): Promise<T> => {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = run().finally(() => {
    if (inflight.get(key) === promise) {
      inflight.delete(key);
    }
  });

  inflight.set(key, promise);
  return promise;
};
