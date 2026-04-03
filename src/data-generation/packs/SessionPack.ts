import { Pack, type DataGenerationPack } from '../../framework/core/index.js';
import type { Session, SessionInput } from '../models/session.js';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function expiresIn(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

const TTL: Record<Session['role'], number> = {
  guest: 1,
  user:  8,
  admin: 24,
};

function buildSession(role: Session['role']): Session {
  return {
    sessionId: `sess-${uid()}${uid()}`,
    userId:    `user-${uid()}`,
    role,
    expiresAt: expiresIn(TTL[role]),
  };
}

@Pack({ name: 'session', description: 'Generates session test data with role-based TTL' })
export class SessionPack implements DataGenerationPack<Session, SessionInput> {
  async createDefault(): Promise<Session> {
    return buildSession('user');
  }

  async createCustom(input: SessionInput): Promise<Session> {
    return buildSession(input.role);
  }

  async delete(_data: Session): Promise<void> {
    // no-op: in-memory generated data, nothing to clean up
  }
}
