import { TASK_NAMES } from './taskNames.js';

export function registerCommands(CypressRef: any): void {
  CypressRef.Commands.add('generateDefault', (packName: string, options?: { storeAs?: string }) => {
    return CypressRef.cy.task(TASK_NAMES.generateDefault, { packName, options });
  });

  CypressRef.Commands.add(
    'generateCustom',
    (packName: string, input: unknown, options?: { storeAs?: string }) => {
      return CypressRef.cy.task(TASK_NAMES.generateCustom, { packName, input, options });
    },
  );

  CypressRef.Commands.add('retrieveData', (storeName: string) => {
    return CypressRef.cy.task(TASK_NAMES.retrieveData, { storeName });
  });
}
