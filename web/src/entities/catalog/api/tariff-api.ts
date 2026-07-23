import { apiClient } from '@web/shared/api/api-client';
import { dedupeAsync } from '@web/shared/lib/dedupe-async';
import { resolvePagination } from '@web/shared/lib/pagination';

import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';
import type { TariffQueryInterface } from '@shared/dto/catalog/tariff-query.dto';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

export const fetchTariffs = async (params: TariffQueryInterface = {}): Promise<PaginatedResultInterface<TariffFindInterface>> => {
  const pagination = resolvePagination(params);
  const { data } = await apiClient.get<PaginatedResultInterface<TariffFindInterface>>(
    '/catalog/tariff/items',
    {
      params: {
        ...params,
        ...pagination,
      },
    },
  );

  return data;
};

export const fetchTariffsFlat = (): Promise<TariffFindInterface[]> => {
  return dedupeAsync('catalog/tariff/flat', async () => {
    const { data } = await apiClient.get<TariffFindInterface[]>('/catalog/tariff/flat');
    return data;
  });
};
