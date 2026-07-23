import { PaginationDto, type PaginationQueryInterface } from '@shared/dto/common/pagination.dto';
import { SearchDto, type SearchQueryInterface } from '@shared/dto/common/search.dto';
import { Dto } from '@shared/dto/dto.class';

/** Query списка клиентов: поиск + пагинация */
export type ClientQueryInterface = SearchQueryInterface & PaginationQueryInterface;

export const ClientQueryDto = Dto.union(SearchDto, PaginationDto);
