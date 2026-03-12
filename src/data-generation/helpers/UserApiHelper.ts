import type { User } from '../models/user.js';

export class UserApiHelper {
  async createDefaultUser(): Promise<User> {
    return { id: 'user-1', name: 'Default User' };
  }

  async deleteUser(_id: string): Promise<void> {
    // placeholder
  }
}
