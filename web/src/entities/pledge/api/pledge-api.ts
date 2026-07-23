import { apiClient } from '@web/shared/api/api-client';
import { resolvePagination } from '@web/shared/lib/pagination';

import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';
import type { ActivePledgesFilterInterface } from '@shared/dto/pledge/active-pledges-filter.dto';
import type { ActivePledgesQueryInterface } from '@shared/dto/pledge/active-pledges-query.dto';
import type { PledgeFindInterface } from '@shared/dto/pledge/pledge-find.dto';
import type { PledgeFormInterface } from '@shared/dto/pledge/pledge-form.dto';
import type { RedeemPledgeFormInterface } from '@shared/dto/pledge/redeem-pledge-form.dto';
import type { RedeemPledgeQueryInterface } from '@shared/dto/pledge/redeem-pledge-query.dto';
import type { RedemptionPreviewInterface } from '@shared/dto/pledge/redemption-preview.dto';

export const createPledge = async (payload: PledgeFormInterface): Promise<PledgeFindInterface> => {
  const { data } = await apiClient.post<PledgeFindInterface>('/pledges', payload);
  return data;
};

export const fetchActivePledges = async (params: ActivePledgesQueryInterface): Promise<PaginatedResultInterface<PledgeFindInterface>> => {
  const pagination = resolvePagination(params);
  const { data } = await apiClient.get<PaginatedResultInterface<PledgeFindInterface>>('/pledges/active/items', {
    params: {
      ...params,
      ...pagination,
    },
  });

  return data;
};

export const fetchActivePledgesFlat = async (params: ActivePledgesFilterInterface): Promise<PledgeFindInterface[]> => {
  const { data } = await apiClient.get<PledgeFindInterface[]>('/pledges/active/flat', {
    params,
  });

  return data;
};

export const fetchRedemptionPreview = async (pledgeId: number, params?: RedeemPledgeQueryInterface): Promise<RedemptionPreviewInterface> => {
  const { data } = await apiClient.get<RedemptionPreviewInterface>(
    `/pledges/${pledgeId}/redemption-preview`,
    {
      params,
    },
  );

  return data;
};

export const redeemPledge = async (pledgeId: number, payload?: RedeemPledgeFormInterface): Promise<PledgeFindInterface> => {
  const { data } = await apiClient.post<PledgeFindInterface>(
    `/pledges/${pledgeId}/redeem`,
    payload ?? {},
  );

  return data;
};
