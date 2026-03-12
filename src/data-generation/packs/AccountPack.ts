import { Pack, type DataGenerationPack } from '../../framework/core/index.js';
import { AccountApiHelper } from '../helpers/AccountApiHelper.js';
import type { Account, AccountInput } from '../models/account.js';

@Pack({ name: 'account', description: 'Generates default or custom accounts' })
export class AccountPack implements DataGenerationPack<Account, AccountInput> {
  private readonly helper = new AccountApiHelper();

  async createDefault(): Promise<Account> {
    return this.helper.createAccount({ role: 'basic' });
  }

  async createCustom(input: AccountInput): Promise<Account> {
    return this.helper.createAccount(input);
  }

  async delete(data: Account): Promise<void> {
    await this.helper.deleteAccount(data.id);
  }
}
