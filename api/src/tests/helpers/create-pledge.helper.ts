
import request from 'supertest';

import type { PledgeFindInterface } from '@shared/dto/pledge/pledge-find.dto';
import type { Server } from 'node:http';

export interface CreatePledgeOptionsInterface {
  tariffId: number;
  clientId: number;
  categoryId: number;
  appraisalAmount: number;
  name?: string;
  characteristics?: Record<string, string | number | boolean>;
}

/**
 * Создаёт залог через HTTP API (для e2e)
 */
export const createPledgeViaApi = async (server: Server, options: CreatePledgeOptionsInterface): Promise<PledgeFindInterface> => {
  const response = await request(server)
    .post('/api/v1/pledges')
    .send({
      tariff: {
        id: options.tariffId,
      },
      client: {
        id: options.clientId,
      },
      items: [
        {
          category: {
            id: options.categoryId,
          },
          name: options.name ?? 'iPhone 13',
          characteristics: options.characteristics ?? {
            model: 'iPhone 13',
            memoryGb: 128,
            screenCondition: 'хорошее',
          },
          appraisalAmount: options.appraisalAmount,
        },
      ],
    })
    .expect(201);

  return response.body;
};
