import request from 'supertest';

import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';

import { createPledgeViaApi } from '@api/tests/helpers/create-pledge.helper';
import {
  createTestApplication,
  getSeedCategories,
  getSeedClients,
  getSeedTariffs,
  type TestApplicationInterface,
} from '@api/tests/helpers/test-app';

describe('Pledge redeem e2e', () => {
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

  const createPledge = async (options: {
    tariffId: number;
    clientId: number;
    categoryId: number;
    appraisalAmount: number;
  }) => {
    return createPledgeViaApi(testApplication.app.getHttpServer(), options);
  };

  it('выкуп в срок: сумма займа + процент за основной период', async () => {
    const [[tariff], [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);
    const loanAmount = 10000;

    const pledge = await createPledge({
      tariffId: tariff.id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: loanAmount,
    });

    const calculationDate = pledge.dueDate;
    const expectedInterest = Math.round(loanAmount * Number(tariff.basePeriodRate) / 100 * 100) / 100;
    const expectedTotal = Math.round((loanAmount + expectedInterest) * 100) / 100;

    const response = await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledge.id}/redeem`)
      .send({
        calculationDate,
      })
      .expect(201);

    expect(response.body.status).toBe('REDEEMED');
    expect(Number(response.body.redemptionAmount)).toBe(expectedTotal);
  });

  it('выкуп с просрочкой: процент за основной период + процент просрочки × периоды', async () => {
    const [[tariff], [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);
    const loanAmount = 10000;
    const overdueDays = 3;
    const overduePeriodDays = Number(tariff.overduePeriodDays) || 1;
    const overduePeriods = Math.ceil(overdueDays / overduePeriodDays);

    const pledge = await createPledge({
      tariffId: tariff.id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: loanAmount,
    });

    const calculationDate = new Date(pledge.dueDate);
    calculationDate.setUTCDate(calculationDate.getUTCDate() + overdueDays);

    const baseInterest = loanAmount * Number(tariff.basePeriodRate) / 100;
    const overdueInterest = loanAmount * Number(tariff.overdueRate) / 100 * overduePeriods;
    const expectedTotal = Math.round((loanAmount + baseInterest + overdueInterest) * 100) / 100;

    const response = await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledge.id}/redeem`)
      .send({
        calculationDate: calculationDate.toISOString(),
      })
      .expect(201);

    expect(Number(response.body.redemptionAmount)).toBe(expectedTotal);
  });

  it('просрочка учитывает overduePeriodDays (ceil дней / период)', async () => {
    const [[tariff], [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);
    const loanAmount = 10000;
    const overduePeriodDays = 7;
    const overdueDays = 10;
    const overduePeriods = Math.ceil(overdueDays / overduePeriodDays);

    await testApplication.databaseService.getManager().getRepository(TariffEntity).update(tariff.id, {
      overduePeriodDays,
    });

    const pledge = await createPledge({
      tariffId: tariff.id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: loanAmount,
    });

    const calculationDate = new Date(pledge.dueDate);
    calculationDate.setUTCDate(calculationDate.getUTCDate() + overdueDays);

    const baseInterest = loanAmount * Number(tariff.basePeriodRate) / 100;
    const overdueInterest = loanAmount * Number(tariff.overdueRate) / 100 * overduePeriods;
    const expectedTotal = Math.round((loanAmount + baseInterest + overdueInterest) * 100) / 100;

    const response = await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledge.id}/redeem`)
      .send({
        calculationDate: calculationDate.toISOString(),
      })
      .expect(201);

    expect(Number(response.body.redemptionAmount)).toBe(expectedTotal);
  });

  it('выкуп ровно в дату «до» — без просрочки', async () => {
    const [[tariff], [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);
    const loanAmount = 5000;

    const pledge = await createPledge({
      tariffId: tariff.id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: loanAmount,
    });

    const preview = await request(testApplication.app.getHttpServer())
      .get(`/api/v1/pledges/${pledge.id}/redemption-preview`)
      .query({
        calculationDate: pledge.dueDate,
      })
      .expect(200);

    expect(preview.body.overdueDays).toBe(0);
    expect(preview.body.isOverdue).toBe(false);

    const expectedInterest = Math.round(loanAmount * Number(tariff.basePeriodRate) / 100 * 100) / 100;
    expect(Number(preview.body.redemptionAmount)).toBe(loanAmount + expectedInterest);
  });

  it('повторный выкуп уже выкупленного залога — ошибка', async () => {
    const [[tariff], [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);

    const pledge = await createPledge({
      tariffId: tariff.id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: 1000,
    });

    await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledge.id}/redeem`)
      .send({
        calculationDate: pledge.dueDate,
      })
      .expect(201);

    const conflictResponse = await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledge.id}/redeem`)
      .send({
        calculationDate: pledge.dueDate,
      })
      .expect(409);

    expect(conflictResponse.body.message).toBe('Залог уже выкуплен');
  });

  it('разные тарифы дают разный результат при одинаковой сумме', async () => {
    const [tariffs, [client], [category]] = await Promise.all([
      getSeedTariffs(testApplication.databaseService),
      getSeedClients(testApplication.databaseService),
      getSeedCategories(testApplication.databaseService),
    ]);
    const loanAmount = 10000;

    const pledgeA = await createPledge({
      tariffId: tariffs[0].id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: loanAmount,
    });
    const pledgeB = await createPledge({
      tariffId: tariffs[1].id,
      clientId: client.id,
      categoryId: category.id,
      appraisalAmount: loanAmount,
    });

    const redeemA = await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledgeA.id}/redeem`)
      .send({
        calculationDate: pledgeA.dueDate,
      })
      .expect(201);

    const redeemB = await request(testApplication.app.getHttpServer())
      .post(`/api/v1/pledges/${pledgeB.id}/redeem`)
      .send({
        calculationDate: pledgeB.dueDate,
      })
      .expect(201);

    expect(Number(redeemA.body.redemptionAmount)).not.toBe(Number(redeemB.body.redemptionAmount));
  });
});
