import { apiDelete } from '../../support/http/apiClient.js';
import type { User } from '../models/user.js';

export class UserApiHelper {
  async createDefaultUser(): Promise<User> {
    return { id: 'user-1', name: 'Default User' };
  }

  async deleteUser(id: string): Promise<void> {
    await apiDelete(`/users/${id}`);
  }
}
