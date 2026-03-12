export class CustomGenerationNotSupportedError extends Error {
  constructor(packName: string) {
    super(`Pack does not support custom generation: ${packName}`);
    this.name = 'CustomGenerationNotSupportedError';
  }
}
