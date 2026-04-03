import { describe, it, expect } from 'vitest';
import { PackNotFoundError } from '../../../../src/framework/core/errors/PackNotFoundError.js';
import { PackMetadataMissingError } from '../../../../src/framework/core/errors/PackMetadataMissingError.js';
import { DuplicateStoreNameError } from '../../../../src/framework/core/errors/DuplicateStoreNameError.js';
import { StoredDataNotFoundError } from '../../../../src/framework/core/errors/StoredDataNotFoundError.js';
import { CustomGenerationNotSupportedError } from '../../../../src/framework/core/errors/CustomGenerationNotSupportedError.js';

describe('PackNotFoundError', () => {
  it('is an Error instance', () => {
    expect(new PackNotFoundError('Foo')).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    expect(new PackNotFoundError('Foo').name).toBe('PackNotFoundError');
  });

  it('includes the pack name in the message', () => {
    expect(new PackNotFoundError('MyPack').message).toContain('MyPack');
  });
});

describe('PackMetadataMissingError', () => {
  it('is an Error instance', () => {
    expect(new PackMetadataMissingError('FooPack')).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    expect(new PackMetadataMissingError('FooPack').name).toBe('PackMetadataMissingError');
  });

  it('includes the registry key in the message', () => {
    expect(new PackMetadataMissingError('FooPack').message).toContain('FooPack');
  });
});

describe('DuplicateStoreNameError', () => {
  it('is an Error instance', () => {
    expect(new DuplicateStoreNameError('key')).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    expect(new DuplicateStoreNameError('key').name).toBe('DuplicateStoreNameError');
  });

  it('includes the duplicate key in the message', () => {
    expect(new DuplicateStoreNameError('dupKey').message).toContain('dupKey');
  });
});

describe('StoredDataNotFoundError', () => {
  it('is an Error instance', () => {
    expect(new StoredDataNotFoundError('k')).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    expect(new StoredDataNotFoundError('k').name).toBe('StoredDataNotFoundError');
  });

  it('includes the missing key in the message', () => {
    expect(new StoredDataNotFoundError('missingKey').message).toContain('missingKey');
  });
});

describe('CustomGenerationNotSupportedError', () => {
  it('is an Error instance', () => {
    expect(new CustomGenerationNotSupportedError('FooPack')).toBeInstanceOf(Error);
  });

  it('has the correct name', () => {
    expect(new CustomGenerationNotSupportedError('FooPack').name).toBe('CustomGenerationNotSupportedError');
  });

  it('includes the pack name in the message', () => {
    expect(new CustomGenerationNotSupportedError('FooPack').message).toContain('FooPack');
  });
});
