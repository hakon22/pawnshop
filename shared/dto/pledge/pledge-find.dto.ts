import * as yup from 'yup';

import { TariffFindDto, type TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';
import { ClientFindDto, type ClientFindInterface } from '@shared/dto/client/client-find.dto';
import { Dto } from '@shared/dto/dto.class';
import { PledgeStatusEnum } from '@shared/dto/pledge/enums/pledge-status.enum';
import { PledgeItemFindDto, type PledgeItemFindInterface } from '@shared/dto/pledge/pledge-item-find.dto';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Залог (чтение) */
export interface PledgeFindInterface {
  /** Идентификатор залога */
  id: number;
  /** Тариф */
  tariff: TariffFindInterface;
  /** Клиент */
  client: ClientFindInterface;
  /** Дата оформления */
  createdDate: string;
  /** Дата окончания базового срока («до») */
  dueDate: string;
  /** Сумма займа */
  loanAmount: number;
  /** Статус залога */
  status: PledgeStatusEnum;
  /** Дата и время выкупа */
  redeemedAt: string | null;
  /** Сумма выкупа (если выкуплен) */
  redemptionAmount: number | null;
  /** Предметы залога */
  items: PledgeItemFindInterface[];
}

export const PledgeFindDto = Dto.create<PledgeFindInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
  tariff: {
    label: 'Тариф',
    nested: () => TariffFindDto,
  },
  client: {
    label: 'Клиент',
    nested: () => ClientFindDto,
  },
  createdDate: {
    label: 'Дата оформления',
    schema: yup.string(),
  },
  dueDate: {
    label: 'Дата окончания',
    schema: yup.string(),
  },
  loanAmount: {
    label: 'Сумма займа',
    integer: false,
    schema: yup.number(),
  },
  status: {
    label: 'Статус',
    schema: yup
      .mixed<PledgeStatusEnum>()
      .oneOf(Object.values(PledgeStatusEnum)),
  },
  redeemedAt: {
    label: 'Дата выкупа',
    optional: true,
    schema: yup.string(),
  },
  redemptionAmount: {
    label: 'Сумма выкупа',
    optional: true,
    integer: false,
    schema: yup.number(),
  },
  items: {
    label: 'Предметы',
    nested: () => PledgeItemFindDto,
    isArray: true,
  },
});
