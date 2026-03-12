export class PackNotFoundError extends Error {
  constructor(packName: string) {
    super(`Pack not found: ${packName}`);
    this.name = 'PackNotFoundError';
  }
}
