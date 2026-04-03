import { definePackRegistry } from '../../framework/core/index.js';
import { AccountPack } from '../packs/AccountPack.js';
import { AddressPack } from '../packs/AddressPack.js';
import { OrderPack } from '../packs/OrderPack.js';
import { ProductPack } from '../packs/ProductPack.js';
import { SessionPack } from '../packs/SessionPack.js';
import { UserPack } from '../packs/UserPack.js';

export const packRegistry = definePackRegistry({
  user: UserPack,
  account: AccountPack,
  product: ProductPack,
  order: OrderPack,
  address: AddressPack,
  session: SessionPack
});
