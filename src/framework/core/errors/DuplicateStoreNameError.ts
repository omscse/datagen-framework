export class DuplicateStoreNameError extends Error {
  constructor(name: string) {
    super(`Stored data already exists for key: ${name}`);
    this.name = 'DuplicateStoreNameError';
  }
}
