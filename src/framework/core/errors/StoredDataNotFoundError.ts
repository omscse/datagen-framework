export class StoredDataNotFoundError extends Error {
  constructor(name: string) {
    super(`Stored data not found for key: ${name}`);
    this.name = 'StoredDataNotFoundError';
  }
}
