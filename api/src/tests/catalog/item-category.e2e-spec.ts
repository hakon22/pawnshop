import request from 'supertest';

import {
  createTestApplication,
  getSeedCategories,
  type TestApplicationInterface,
} from '@api/tests/helpers/test-app';

describe('Catalog item-categories e2e', () => {
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

  it('возвращает категории с пагинацией и схемой характеристик', async () => {
    const seedCategories = await getSeedCategories(testApplication.databaseService);

    const response = await request(testApplication.app.getHttpServer())
      .get('/api/v1/catalog/item-category/items')
      .query({
        limit: 10,
        offset: 0,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      count: seedCategories.length,
      limit: 10,
      offset: 0,
    });
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0].characteristicFields.length).toBeGreaterThan(0);
  });
});
