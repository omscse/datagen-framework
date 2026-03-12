export interface Account {
  id: string;
  role: 'basic' | 'admin';
}

export interface AccountInput {
  role: 'basic' | 'admin';
}
