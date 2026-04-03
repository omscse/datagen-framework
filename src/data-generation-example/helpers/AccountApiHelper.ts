import { apiDelete, apiPost } from '../../support/http/apiClient.js';
import type { Account, AccountInput } from '../models/account.js';

export class AccountApiHelper {
  async createAccount(input: AccountInput): Promise<Account> {
    return apiPost<Account>('/accounts', {
      id: `account-${input.role}`,
      role: input.role,
    });
  }

  async deleteAccount(id: string): Promise<void> {
    await apiDelete(`/accounts/${id}`);
  }
}
