import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Тариф залога (чтение) */
export interface TariffFindInterface {
  /** Идентификатор тарифа */
  id: number;
  /** Название тарифа */
  name: string;
  /** Базовый срок в календарных днях */
  basePeriodDays: number;
  /** Процент за базовый период */
  basePeriodRate: number;
  /** Период просрочки в днях (справочно для UI) */
  overduePeriodDays: number;
  /** Процент просрочки за один календарный день */
  overdueRate: number;
}

export const TariffFindDto = Dto.create<TariffFindInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
  name: {
    label: 'Название',
    schema: yup.string(),
  },
  basePeriodDays: {
    label: 'Базовый срок',
    schema: yup.number(),
  },
  basePeriodRate: {
    label: 'Ставка базового периода',
    integer: false,
    schema: yup.number(),
  },
  overduePeriodDays: {
    label: 'Срок просрочки',
    schema: yup.number(),
  },
  overdueRate: {
    label: 'Ставка просрочки',
    integer: false,
    schema: yup.number(),
  },
});
