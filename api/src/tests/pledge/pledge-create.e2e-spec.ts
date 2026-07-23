import request from 'supertest';

import { createPledgeViaApi } from '@api/tests/helpers/create-pledge.helper';
import {
  createTestApplication,
  getSeedCategories,
  getSeedClients,
  getSeedTariffs,
  type TestApplicationInterface,
} from '@api/tests/helpers/test-app';

describe('Pledge create e2e', () => {
  let testApplication: TestApplicationInterface;

  beforeAll(async () => {
    testApplication = await createTestApplication();
  });

  beforeEach(async () => {
    await testApplication.resetDatabase();
  });

  afterAll(async () => {
    if (testApplication) {
      await testApplication.close();
    }
  });

  it('создаёт залог и отдаёт его в активных по clientId', async () => {
    const [[tariff], [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);

    const pledge = await createPledgeViaApi(testApplication.app.getHttpServer(), {
      tariffId: tariff.id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: 7500,
    });

    expect(pledge.id).toBeDefined();
    expect(pledge.status).toBe('ACTIVE');
    expect(Number(pledge.loanAmount)).toBe(7500);

    const active = await request(testApplication.app.getHttpServer())
      .get('/api/v1/pledges/active/items')
      .query({
        clientId: client.id,
      })
      .expect(200);

    expect(active.body.items.some((row: { id: number; }) => row.id === pledge.id)).toBe(true);
    expect(active.body.count).toBeGreaterThanOrEqual(1);
    expect(active.body.limit).toBeDefined();
    expect(active.body.offset).toBe(0);
  });
});
