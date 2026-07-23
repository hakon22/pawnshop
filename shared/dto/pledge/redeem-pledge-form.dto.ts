import { Dto } from '@shared/dto/dto.class';
import { dateSchema } from '@shared/dto/schemas/date.schema';

/** Тело выкупа / общие параметры даты расчёта */
export interface RedeemPledgeFormInterface {
  /**
   * Дата расчёта (и момент выкупа при POST; по умолчанию — сейчас).
   * Предпочтительно `YYYY-MM-DD`; допускаются Date / ISO.
   */
  calculationDate?: Date | string;
}

export const RedeemPledgeFormDto = Dto.create<RedeemPledgeFormInterface>({
  calculationDate: {
    label: 'Дата расчёта',
    optional: true,
    schema: dateSchema,
  },
});
