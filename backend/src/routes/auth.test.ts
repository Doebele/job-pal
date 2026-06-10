import { strict as assert } from 'node:assert';
import test from 'node:test';
import { Hono } from 'hono';
import authRoutes from './auth';
import { db } from '../db';

type DbMockOptions = {
  selectResponse?: unknown[];
};

function createApp() {
  const app = new Hono();
  app.route('/auth', authRoutes);
  return app;
}

function hasColumnParam(
  value: unknown,
  columnName: string,
  paramValue: string,
  seen = new WeakSet<object>()
): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }
  seen.add(value);

  const maybeParam = value as { value?: unknown; encoder?: { name?: string } };
  if (maybeParam.value === paramValue && maybeParam.encoder?.name === columnName) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasColumnParam(item, columnName, paramValue, seen));
  }

  return Object.values(value).some((item) => hasColumnParam(item, columnName, paramValue, seen));
}

function installDbMock({ selectResponse = [] }: DbMockOptions = {}) {
  const mutableDb = db as unknown as {
    select: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
    delete: (...args: unknown[]) => unknown;
  };
  const originalSelect = mutableDb.select;
  const originalUpdate = mutableDb.update;
  const originalDelete = mutableDb.delete;
  const whereConditions: unknown[] = [];
  let updateCalls = 0;
  let deleteCalls = 0;

  mutableDb.select = () => {
    const chain: any = {
      from: () => chain,
      where: (condition: unknown) => {
        whereConditions.push(condition);
        return chain;
      },
      limit: async () => selectResponse,
    };
    return chain;
  };

  mutableDb.update = () => {
    updateCalls += 1;
    const chain: any = {
      set: () => chain,
      where: () => chain,
    };
    return chain;
  };

  mutableDb.delete = () => {
    deleteCalls += 1;
    const chain: any = {
      where: () => chain,
    };
    return chain;
  };

  return {
    whereConditions,
    get updateCalls() {
      return updateCalls;
    },
    get deleteCalls() {
      return deleteCalls;
    },
    restore() {
      mutableDb.select = originalSelect;
      mutableDb.update = originalUpdate;
      mutableDb.delete = originalDelete;
    },
  };
}

test('reset password only looks up password reset tokens', async () => {
  const dbMock = installDbMock();
  const app = createApp();

  try {
    const res = await app.request('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'email-verification-token',
        newPassword: 'new-secure-password',
      }),
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Token ungültig oder abgelaufen' });
    assert.equal(dbMock.updateCalls, 0);
    assert.equal(dbMock.deleteCalls, 0);
    assert.ok(hasColumnParam(dbMock.whereConditions[0], 'token_type', 'password_reset'));
  } finally {
    dbMock.restore();
  }
});

test('verify email only looks up email verification tokens', async () => {
  const dbMock = installDbMock();
  const app = createApp();

  try {
    const res = await app.request('/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'password-reset-token' }),
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Token ungültig oder abgelaufen' });
    assert.equal(dbMock.updateCalls, 0);
    assert.equal(dbMock.deleteCalls, 0);
    assert.ok(hasColumnParam(dbMock.whereConditions[0], 'token_type', 'email_verification'));
  } finally {
    dbMock.restore();
  }
});
