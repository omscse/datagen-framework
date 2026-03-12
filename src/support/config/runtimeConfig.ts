export type RuntimeConfig = Record<string, unknown>;

let currentConfig: RuntimeConfig | undefined;

export function initConfig(config: RuntimeConfig): void {
  currentConfig = config;
}

export function getConfig(): RuntimeConfig {
  if (!currentConfig) throw new Error('Support config has not been initialized.');
  return currentConfig;
}
