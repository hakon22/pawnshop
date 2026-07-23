import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Предпросмотр расчёта выкупа */
export interface RedemptionPreviewInterface {
  /** Идентификатор залога */
  pledgeId: number;
  /** Сумма займа */
  loanAmount: number;
  /** Проценты за базовый период */
  baseInterest: number;
  /** Число дней просрочки */
  overdueDays: number;
  /** Проценты за просрочку */
  overdueInterest: number;
  /** Итого проценты */
  interest: number;
  /** Сумма к выкупу */
  redemptionAmount: number;
  /** Дата окончания базового срока */
  dueDate: string;
  /** Момент расчёта */
  calculatedAt: string;
  /** Есть ли просрочка */
  isOverdue: boolean;
}

export const RedemptionPreviewDto = Dto.create<RedemptionPreviewInterface>({
  pledgeId: {
    label: 'Залог',
    schema: positiveIdSchema,
  },
  loanAmount: {
    label: 'Сумма займа',
    integer: false,
    schema: yup.number(),
  },
  baseInterest: {
    label: 'Проценты базового периода',
    integer: false,
    positive: false,
    schema: yup
      .number()
      .min(0),
  },
  overdueDays: {
    label: 'Дни просрочки',
    positive: false,
    schema: yup
      .number()
      .min(0),
  },
  overdueInterest: {
    label: 'Проценты просрочки',
    integer: false,
    positive: false,
    schema: yup
      .number()
      .min(0),
  },
  interest: {
    label: 'Итого проценты',
    integer: false,
    positive: false,
    schema: yup
      .number()
      .min(0),
  },
  redemptionAmount: {
    label: 'Сумма к выкупу',
    integer: false,
    schema: yup.number(),
  },
  dueDate: {
    label: 'Дата окончания',
    schema: yup.string(),
  },
  calculatedAt: {
    label: 'Момент расчёта',
    schema: yup.string(),
  },
  isOverdue: {
    label: 'Просрочка',
    schema: yup.boolean(),
  },
});
