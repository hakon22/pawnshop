import { Controller, Get, Inject, Query } from '@nestjs/common';

import { ResponseDto } from '@infrastructure/validation/response-dto.decorator';
import { YupValidationPipe } from '@infrastructure/validation/yup-validation.pipe';

import { ItemCategoryService } from '@api/modules/catalog/services/item-category.service';

import { ItemCategoryFindDto, type ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import { ItemCategoryQueryDto, type ItemCategoryQueryInterface } from '@shared/dto/catalog/item-category-query.dto';

import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

@Controller('catalog/item-category')
export class ItemCategoryController {
  @Inject(ItemCategoryService)
  private readonly itemCategoryService: ItemCategoryService;

  /**
   * Все категории без пагинации
   * @returns список категорий ({@link ItemCategoryFindDto[]} через {@link ResponseDto})
   */
  @Get('flat')
  @ResponseDto(ItemCategoryFindDto, {
    isArray: true,
  })
  public findFlat() {
    return this.itemCategoryService.findFlat();
  }

  /**
   * Список категорий
   * @param query - пагинация ({@link ItemCategoryQueryInterface})
   * @returns страница категорий ({@link PaginatedResultInterface} с {@link ItemCategoryFindInterface})
   */
  @Get('items')
  @ResponseDto(ItemCategoryFindDto, {
    paginated: true,
  })
  public findMany(
    @Query(YupValidationPipe(ItemCategoryQueryDto)) query: ItemCategoryQueryInterface,
  ): Promise<PaginatedResultInterface<ItemCategoryFindInterface>> {
    return this.itemCategoryService.findMany(query);
  }
}
