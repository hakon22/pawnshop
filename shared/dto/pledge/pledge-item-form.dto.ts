import { isNil } from 'lodash-es';
import * as yup from 'yup';

import { IdRefDto, type IdRefInterface } from '@shared/dto/common/id-ref';
import { Dto } from '@shared/dto/dto.class';

import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';

/** Предмет залога (создание / форма) */
export interface PledgeItemFormInterface {
  /** Категория (body — вложенная ссылка по id) */
  category: IdRefInterface<ItemCategoryFindInterface>;
  /** Наименование предмета */
  name: string;
  /** Характеристики по схеме категории */
  characteristics: Record<string, string | number | boolean>;
  /** Оценочная стоимость */
  appraisalAmount: number;
}

export const PledgeItemFormDto = Dto.create<PledgeItemFormInterface>({
  category: {
    label: 'Группа товара',
    nested: () => IdRefDto,
  },
  name: {
    label: 'Название товара',
    schema: yup.string(),
  },
  characteristics: {
    label: 'Характеристики',
    schema: yup
      .mixed()
      .required()
      .test(
        'is-plain-object',
        'Характеристики должны быть объектом',
        value => !isNil(value)
          && typeof value === 'object'
          && !Array.isArray(value),
      ),
  },
  appraisalAmount: {
    label: 'Оценочная стоимость',
    integer: false,
    schema: yup.number(),
  },
});
