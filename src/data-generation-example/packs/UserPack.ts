import { Pack, type DataGenerationPack } from '../../framework/core/index.js';
import type { User } from '../models/user.js';
import { UserApiHelper } from '../helpers/UserApiHelper.js';

@Pack({ name: 'user', description: 'Generates default users' })
export class UserPack implements DataGenerationPack<User> {
  private readonly helper = new UserApiHelper();

  async createDefault(): Promise<User> {
    return this.helper.createDefaultUser();
  }

  async delete(data: User): Promise<void> {
    await this.helper.deleteUser(data.id);
  }
}
