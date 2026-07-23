import { IdRefDto, type IdRefInterface } from '@shared/dto/common/id-ref';
import { Dto } from '@shared/dto/dto.class';
import { PledgeItemFormDto, type PledgeItemFormInterface } from '@shared/dto/pledge/pledge-item-form.dto';

import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';
import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';

/** Залог (создание / форма) */
export interface PledgeFormInterface {
  /** Тариф (body — вложенная ссылка по id) */
  tariff: IdRefInterface<TariffFindInterface>;
  /** Клиент (body — вложенная ссылка по id) */
  client: IdRefInterface<ClientFindInterface>;
  /** Предметы залога */
  items: PledgeItemFormInterface[];
}

export const PledgeFormDto = Dto.create<PledgeFormInterface>({
  tariff: {
    label: 'Тариф',
    nested: () => IdRefDto,
  },
  client: {
    label: 'Клиент',
    nested: () => IdRefDto,
  },
  items: {
    label: 'Товары',
    nested: () => PledgeItemFormDto,
    isArray: true,
  },
});
