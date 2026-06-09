import { strict as assert } from 'node:assert';
import test from 'node:test';
import { Hono } from 'hono';
import applicationRoutes from './applications';
import { db } from '../db';

const ownerEmployerId = '11111111-1111-4111-8111-111111111111';
const otherEmployerId = '22222222-2222-4222-8222-222222222222';
const jobId = '33333333-3333-4333-8333-333333333333';
const applicationId = '44444444-4444-4444-8444-444444444444';

type TestUser = {
  id: string;
  email: string;
  role: string;
};

type DbMockOptions = {
  selectResponses: unknown[][];
  updateResponse?: unknown[];
};

function createApp(user: TestUser) {
  const app = new Hono();

  app.use('*', async (c, next) => {
    (c as any).user = user;
    await next();
  });
  app.route('/applications', applicationRoutes);

  return app;
}

function installDbMock({ selectResponses, updateResponse = [] }: DbMockOptions) {
  const mutableDb = db as unknown as {
    select: (...args: unknown[]) => unknown;
    update: (...args: unknown[]) => unknown;
  };
  const originalSelect = mutableDb.select;
  const originalUpdate = mutableDb.update;
  let updateCalls = 0;

  mutableDb.select = () => {
    const response = selectResponses.shift() ?? [];
    const chain: any = {
      from: () => chain,
      leftJoin: () => chain,
      where: () => chain,
      limit: async () => response,
      orderBy: async () => response,
    };
    return chain;
  };

  mutableDb.update = () => {
    updateCalls += 1;
    const chain: any = {
      set: () => chain,
      where: () => chain,
      returning: async () => updateResponse,
    };
    return chain;
  };

  return {
    get updateCalls() {
      return updateCalls;
    },
    restore() {
      mutableDb.select = originalSelect;
      mutableDb.update = originalUpdate;
    },
  };
}

test('employer cannot list applications for another employer job', async () => {
  const dbMock = installDbMock({ selectResponses: [[]] });
  const app = createApp({
    id: ownerEmployerId,
    email: 'owner@example.com',
    role: 'employer',
  });

  try {
    const res = await app.request(`/applications?jobId=${jobId}`);

    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'Job not found' });
    assert.equal(dbMock.updateCalls, 0);
  } finally {
    dbMock.restore();
  }
});

test('employer cannot update application status for another employer job', async () => {
  const dbMock = installDbMock({
    selectResponses: [[{ application: { id: applicationId, jobId }, job: { employerId: otherEmployerId } }]],
  });
  const app = createApp({
    id: ownerEmployerId,
    email: 'owner@example.com',
    role: 'employer',
  });

  try {
    const res = await app.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });

    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'Application not found' });
    assert.equal(dbMock.updateCalls, 0);
  } finally {
    dbMock.restore();
  }
});

test('employer can update application status for own job', async () => {
  const updatedApplication = { id: applicationId, jobId, status: 'reviewed' };
  const dbMock = installDbMock({
    selectResponses: [[{ application: { id: applicationId, jobId }, job: { employerId: ownerEmployerId } }]],
    updateResponse: [updatedApplication],
  });
  const app = createApp({
    id: ownerEmployerId,
    email: 'owner@example.com',
    role: 'employer',
  });

  try {
    const res = await app.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'reviewed' }),
    });

    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { application: updatedApplication });
    assert.equal(dbMock.updateCalls, 1);
  } finally {
    dbMock.restore();
  }
});
