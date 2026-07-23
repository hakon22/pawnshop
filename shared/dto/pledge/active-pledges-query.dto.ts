import { PaginationDto, type PaginationQueryInterface } from '@shared/dto/common/pagination.dto';
import { Dto } from '@shared/dto/dto.class';
import { ActivePledgesFilterDto, type ActivePledgesFilterInterface } from '@shared/dto/pledge/active-pledges-filter.dto';

/** Query активных залогов клиента с пагинацией */
export interface ActivePledgesQueryInterface extends PaginationQueryInterface, ActivePledgesFilterInterface {}

export const ActivePledgesQueryDto = Dto.union<ActivePledgesQueryInterface>(
  PaginationDto,
  ActivePledgesFilterDto,
);
