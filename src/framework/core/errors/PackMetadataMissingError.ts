export class PackMetadataMissingError extends Error {
  constructor(registryKey: string) {
    super(`Pack "${registryKey}" is missing @Pack metadata.`);
    this.name = 'PackMetadataMissingError';
  }
}
