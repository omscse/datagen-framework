export function registerHooks(
  on: (event: 'after:run', handler: () => Promise<void> | void) => void,
  deps: { cleanup: () => Promise<void> | void },
): void {
  on('after:run', async () => {
    await deps.cleanup();
  });
}
