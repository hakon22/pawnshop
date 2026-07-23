import { PaginationDto, type PaginationQueryInterface } from '@shared/dto/common/pagination.dto';

/** Query списка тарифов: пагинация */
export type TariffQueryInterface = PaginationQueryInterface;

export const TariffQueryDto = PaginationDto;
