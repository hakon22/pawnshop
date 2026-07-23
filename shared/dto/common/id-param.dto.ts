import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Параметр пути с числовым идентификатором */
export interface IdParamInterface {
  /** Идентификатор сущности */
  id: number;
}

export const IdParamDto = Dto.create<IdParamInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
});
