import request from 'supertest';

import {
  createTestApplication,
  getSeedTariffs,
  type TestApplicationInterface,
} from '@api/tests/helpers/test-app';

describe('Catalog tariffs e2e', () => {
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

  it('возвращает тарифы с пагинацией', async () => {
    const seedTariffs = await getSeedTariffs(testApplication.databaseService);

    const response = await request(testApplication.app.getHttpServer())
      .get('/api/v1/catalog/tariff/items')
      .query({
        limit: 1,
        offset: 0,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      count: seedTariffs.length,
      limit: 1,
      offset: 0,
    });
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].id).toBe(seedTariffs[0].id);
  });
});
