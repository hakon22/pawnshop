import { apiClient } from '@web/shared/api/api-client';
import { dedupeAsync } from '@web/shared/lib/dedupe-async';
import { resolvePagination } from '@web/shared/lib/pagination';

import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import type { ItemCategoryQueryInterface } from '@shared/dto/catalog/item-category-query.dto';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

export const fetchItemCategories = async (params: ItemCategoryQueryInterface = {}): Promise<PaginatedResultInterface<ItemCategoryFindInterface>> => {
  const pagination = resolvePagination(params);
  const { data } = await apiClient.get<PaginatedResultInterface<ItemCategoryFindInterface>>(
    '/catalog/item-category/items',
    {
      params: {
        ...params,
        ...pagination,
      },
    },
  );

  return data;
};

export const fetchItemCategoriesFlat = (): Promise<ItemCategoryFindInterface[]> => {
  return dedupeAsync('catalog/item-category/flat', async () => {
    const { data } = await apiClient.get<ItemCategoryFindInterface[]>('/catalog/item-category/flat');
    return data;
  });
};
