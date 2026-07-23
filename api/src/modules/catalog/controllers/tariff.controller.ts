import { Controller, Get, Inject, Query } from '@nestjs/common';

import { ResponseDto } from '@infrastructure/validation/response-dto.decorator';
import { YupValidationPipe } from '@infrastructure/validation/yup-validation.pipe';

import { TariffService } from '@api/modules/catalog/services/tariff.service';

import { TariffFindDto, type TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';
import { TariffQueryDto, type TariffQueryInterface } from '@shared/dto/catalog/tariff-query.dto';

import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

@Controller('catalog/tariff')
export class TariffController {
  @Inject(TariffService)
  private readonly tariffService: TariffService;

  /**
   * Все тарифы без пагинации
   * @returns список тарифов ({@link TariffFindDto[]} через {@link ResponseDto})
   */
  @Get('flat')
  @ResponseDto(TariffFindDto, {
    isArray: true,
  })
  public findFlat() {
    return this.tariffService.findFlat();
  }

  /**
   * Список тарифов
   * @param query - пагинация ({@link TariffQueryInterface})
   * @returns страница тарифов ({@link PaginatedResultInterface} с {@link TariffFindInterface})
   */
  @Get('items')
  @ResponseDto(TariffFindDto, {
    paginated: true,
  })
  public findMany(
    @Query(YupValidationPipe(TariffQueryDto)) query: TariffQueryInterface,
  ): Promise<PaginatedResultInterface<TariffFindInterface>> {
    return this.tariffService.findMany(query);
  }
}
