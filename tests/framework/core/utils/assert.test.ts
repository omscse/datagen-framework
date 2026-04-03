import { describe, it, expect } from 'vitest';
import { assert } from '../../../../src/framework/core/utils/assert.js';

describe('assert', () => {
  it('does not throw when condition is truthy', () => {
    expect(() => assert(true, 'should not throw')).not.toThrow();
    expect(() => assert(1, 'should not throw')).not.toThrow();
    expect(() => assert('non-empty', 'should not throw')).not.toThrow();
  });

  it('throws an Error with the provided message when condition is falsy', () => {
    expect(() => assert(false, 'condition failed')).toThrow('condition failed');
    expect(() => assert(0, 'zero is falsy')).toThrow('zero is falsy');
    expect(() => assert(null, 'null is falsy')).toThrow('null is falsy');
    expect(() => assert(undefined, 'undefined is falsy')).toThrow('undefined is falsy');
    expect(() => assert('', 'empty string is falsy')).toThrow('empty string is falsy');
  });

  it('throws a native Error instance', () => {
    expect(() => assert(false, 'oops')).toThrow(Error);
  });
});
