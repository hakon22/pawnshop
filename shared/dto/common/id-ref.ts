import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/**
 * Ссылка на сущность только по `id` (для body / find-ответов, не для плоских query-параметров)
 * @example body `client: IdRefInterface<ClientFindInterface>` → `{ id: number }`
 * @example query — предпочитать `clientId: number`
 */
export type IdRefInterface<T extends { id: number; } = { id: number; }> = Pick<T, 'id'>;

/** DTO для {@link IdRefInterface} */
export const IdRefDto = Dto.create<IdRefInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
});
