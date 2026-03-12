export interface CleanupReport {
  cleaned: string[];
  failed: Array<{ key: string; reason: string }>;
}
