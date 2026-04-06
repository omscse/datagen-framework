/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Generate default test data for the given pack name.
     * @param packName - The registered pack name
     * @param options.storeAs - Optional key to store the generated data under
     */
    generateDefault(packName: string, options?: { storeAs?: string }): Chainable<unknown>;

    /**
     * Generate custom test data for the given pack name with a specific input.
     * @param packName - The registered pack name
     * @param input - Custom input passed to the pack's generate method
     * @param options.storeAs - Optional key to store the generated data under
     */
    generateCustom(packName: string, input: unknown, options?: { storeAs?: string }): Chainable<unknown>;

    /**
     * Retrieve previously stored test data by store name.
     * @param storeName - The key used when the data was stored
     */
    retrieveData(storeName: string): Chainable<unknown>;
  }
}
