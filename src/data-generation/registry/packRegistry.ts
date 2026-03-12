import { definePackRegistry } from '../../framework/core/index.js';
import { AccountPack } from '../packs/AccountPack.js';
import { UserPack } from '../packs/UserPack.js';

export const packRegistry = definePackRegistry({
  user: UserPack,
  account: AccountPack,
});
