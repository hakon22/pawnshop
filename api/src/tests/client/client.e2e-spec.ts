import request from 'supertest';

import {
  createTestApplication,
  getSeedClients,
  type TestApplicationInterface,
} from '@api/tests/helpers/test-app';

describe('Client e2e', () => {
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

  it('возвращает клиентов с пагинацией', async () => {
    const seedClients = await getSeedClients(testApplication.databaseService);

    const response = await request(testApplication.app.getHttpServer())
      .get('/api/v1/client/items')
      .query({
        limit: 1,
        offset: 0,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      count: seedClients.length,
      limit: 1,
      offset: 0,
    });
    expect(response.body.items).toHaveLength(1);
  });

  it('создаёт клиента и находит по search', async () => {
    const created = await request(testApplication.app.getHttpServer())
      .post('/api/v1/client')
      .send({
        lastName: 'Тестов',
        firstName: 'Иван',
        phone: '79990001122',
      })
      .expect(201);

    expect(created.body.fullName).toContain('Тестов');

    const found = await request(testApplication.app.getHttpServer())
      .get('/api/v1/client/items')
      .query({
        search: 'Тестов',
      })
      .expect(200);

    expect(found.body.count).toBeGreaterThanOrEqual(1);
    expect(found.body.items.some((client: { id: number; }) => client.id === created.body.id)).toBe(true);
  });
});
