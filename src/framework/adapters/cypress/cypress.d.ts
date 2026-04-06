/// <reference types="cypress" />

declare namespace DatagenFramework {
  /**
   * Augment this interface in your project to enable strict typing for cy commands.
   *
   * @example
   * // cypress/support/datagen.d.ts
   * import type { packRegistry } from '../../src/registry/packRegistry';
   *
   * declare namespace DatagenFramework {
   *   interface PackRegistry extends typeof packRegistry {}
   * }
   *
   * After this, `cy.generateDefault('user')` returns `Chainable<User>`,
   * `cy.generateCustom('account', input)` enforces `AccountInput`, etc.
   */
  interface PackRegistry {}
}

// Infer the instance from a constructor type
type _InstanceOf<C> = C extends new () => infer I ? I : never;

// Return type of createDefault() for a given pack name
type _OutputFor<N extends keyof DatagenFramework.PackRegistry> =
  _InstanceOf<DatagenFramework.PackRegistry[N]> extends { createDefault(): Promise<infer TData> }
    ? TData
    : unknown;

// Argument type of createCustom() for a given pack name
type _InputFor<N extends keyof DatagenFramework.PackRegistry> =
  _InstanceOf<DatagenFramework.PackRegistry[N]> extends { createCustom(input: infer TInput): Promise<any> }
    ? TInput
    : unknown;

// Subset of pack names whose class has a createCustom method
type _CustomPackNames = {
  [K in keyof DatagenFramework.PackRegistry]: _InstanceOf<DatagenFramework.PackRegistry[K]> extends {
    createCustom(input: any): Promise<any>;
  }
    ? K
    : never;
}[keyof DatagenFramework.PackRegistry];

declare namespace Cypress {
  interface Chainable {
    /**
     * Generate default test data using a registered pack.
     * Return type is inferred from the pack when PackRegistry is augmented.
     */
    generateDefault<N extends keyof DatagenFramework.PackRegistry>(
      packName: N,
      options?: { storeAs?: string },
    ): Chainable<_OutputFor<N>>;
    /** Fallback overload when PackRegistry is not augmented. */
    generateDefault(packName: string, options?: { storeAs?: string }): Chainable<unknown>;

    /**
     * Generate custom test data using a registered pack.
     * Only pack names that declare `createCustom` are accepted.
     * Input type is inferred from the pack's `createCustom` signature.
     */
    generateCustom<N extends _CustomPackNames>(
      packName: N,
      input: _InputFor<N>,
      options?: { storeAs?: string },
    ): Chainable<_OutputFor<N>>;
    /** Fallback overload when PackRegistry is not augmented. */
    generateCustom(packName: string, input: unknown, options?: { storeAs?: string }): Chainable<unknown>;

    /**
     * Retrieve previously stored test data by store key.
     * Provide a type parameter to type the resolved value.
     * @example cy.retrieveData<User>('adminUser')
     */
    retrieveData<T = unknown>(storeName: string): Chainable<T>;
  }
}
