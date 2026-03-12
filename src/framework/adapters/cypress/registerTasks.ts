import { TASK_NAMES } from './taskNames.js';

export function registerTasks(
  on: (event: 'task', handlers: Record<string, (...args: any[]) => any>) => void,
  deps: {
    generateDefault: (packName: string, options?: { storeAs?: string }) => Promise<unknown>;
    generateCustom: (packName: string, input: unknown, options?: { storeAs?: string }) => Promise<unknown>;
    retrieveData: (storeName: string) => Promise<unknown>;
  },
): void {
  on('task', {
    [TASK_NAMES.generateDefault]: ({ packName, options }) => deps.generateDefault(packName, options),
    [TASK_NAMES.generateCustom]: ({ packName, input, options }) => deps.generateCustom(packName, input, options),
    [TASK_NAMES.retrieveData]: ({ storeName }) => deps.retrieveData(storeName),
  });
}
