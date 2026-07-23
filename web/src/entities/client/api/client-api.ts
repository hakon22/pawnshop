import { apiClient } from '@web/shared/api/api-client';
import { dedupeAsync } from '@web/shared/lib/dedupe-async';
import { resolvePagination } from '@web/shared/lib/pagination';

import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';
import type { ClientFormInterface } from '@shared/dto/client/client-form.dto';
import type { ClientQueryInterface } from '@shared/dto/client/client-query.dto';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

export const searchClients = (params: ClientQueryInterface = {}): Promise<PaginatedResultInterface<ClientFindInterface>> => {
  const pagination = resolvePagination(params);
  const search = params.search ?? '';
  const key = `client/items:${search}:${pagination.offset}:${pagination.limit}`;

  return dedupeAsync(key, async () => {
    const { data } = await apiClient.get<PaginatedResultInterface<ClientFindInterface>>('/client/items', {
      params: {
        ...params,
        ...pagination,
      },
    });

    return data;
  });
};

export const createClient = async (payload: ClientFormInterface): Promise<ClientFindInterface> => {
  const { data } = await apiClient.post<ClientFindInterface>('/client', payload);
  return data;
};
