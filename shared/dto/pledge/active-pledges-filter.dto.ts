import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Фильтр активных залогов по клиенту (query — плоский id) */
export interface ActivePledgesFilterInterface {
  /** Идентификатор клиента */
  clientId: number;
}

export const ActivePledgesFilterDto = Dto.create<ActivePledgesFilterInterface>({
  clientId: {
    label: 'Клиент',
    schema: positiveIdSchema,
  },
});
