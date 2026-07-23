import { PaginationDto, type PaginationQueryInterface } from '@shared/dto/common/pagination.dto';

/** Query списка категорий предметов: пагинация */
export type ItemCategoryQueryInterface = PaginationQueryInterface;

export const ItemCategoryQueryDto = PaginationDto;
