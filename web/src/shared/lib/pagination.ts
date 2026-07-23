import { DEFAULT_LIMIT, DEFAULT_OFFSET, type PaginationQueryInterface } from '@shared/dto/common/pagination.dto';

import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

/** Пагинация с подставленными дефолтами */
export type ResolvedPaginationInterface = Required<PaginationQueryInterface>;

/**
 * Всегда отдаёт limit/offset (дефолты, если не передали)
 * @param params - частичные query-параметры
 * @returns limit и offset
 */
export const resolvePagination = (params?: PaginationQueryInterface): ResolvedPaginationInterface => {
  return {
    limit: params?.limit ?? DEFAULT_LIMIT,
    offset: params?.offset ?? DEFAULT_OFFSET,
  };
};

/**
 * Есть ли ещё страницы после текущей
 * @param page - ответ списка
 * @returns true, если загружено не всё
 */
export const hasMorePages = <T>(page: PaginatedResultInterface<T>): boolean => {
  return page.offset + page.items.length < page.count;
};
