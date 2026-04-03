export interface Session {
  sessionId: string;
  userId: string;
  role: 'guest' | 'user' | 'admin';
  expiresAt: string;
}

export interface SessionInput {
  role: Session['role'];
}
