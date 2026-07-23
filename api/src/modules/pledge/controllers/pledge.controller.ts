import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';

import { ResponseDto } from '@infrastructure/validation/response-dto.decorator';
import { YupValidationPipe } from '@infrastructure/validation/yup-validation.pipe';

import { PledgeService } from '@api/modules/pledge/services/pledge.service';

import { IdParamDto, type IdParamInterface } from '@shared/dto/common/id-param.dto';
import { ActivePledgesFilterDto, type ActivePledgesFilterInterface } from '@shared/dto/pledge/active-pledges-filter.dto';
import { ActivePledgesQueryDto, type ActivePledgesQueryInterface } from '@shared/dto/pledge/active-pledges-query.dto';
import { PledgeFindDto } from '@shared/dto/pledge/pledge-find.dto';
import { PledgeFormDto, type PledgeFormInterface } from '@shared/dto/pledge/pledge-form.dto';
import { RedeemPledgeFormDto, type RedeemPledgeFormInterface } from '@shared/dto/pledge/redeem-pledge-form.dto';
import { RedeemPledgeQueryDto, type RedeemPledgeQueryInterface } from '@shared/dto/pledge/redeem-pledge-query.dto';
import { RedemptionPreviewDto, type RedemptionPreviewInterface } from '@shared/dto/pledge/redemption-preview.dto';

@Controller('pledges')
export class PledgeController {
  @Inject(PledgeService)
  private readonly pledgeService: PledgeService;

  /**
   * Создание залога
   * @param body - форма залога ({@link PledgeFormInterface})
   * @returns залог; HTTP-тело — {@link PledgeFindDto} через {@link ResponseDto}
   */
  @Post()
  @ResponseDto(PledgeFindDto)
  public createOne(
    @Body(YupValidationPipe(PledgeFormDto)) body: PledgeFormInterface,
  ) {
    return this.pledgeService.createOne(body);
  }

  /**
   * Активные залоги
   * @param query - фильтр по клиенту и пагинация ({@link ActivePledgesQueryInterface})
   * @returns страница залогов ({@link PaginatedResultInterface} → {@link PledgeFindDto} через {@link ResponseDto})
   */
  @Get('active/items')
  @ResponseDto(PledgeFindDto, {
    paginated: true,
  })
  public findMany(
    @Query(YupValidationPipe(ActivePledgesQueryDto)) query: ActivePledgesQueryInterface,
  ) {
    return this.pledgeService.findMany(query);
  }

  /**
   * Все активные залоги без пагинации
   * @param query - фильтр по клиенту ({@link ActivePledgesFilterInterface})
   * @returns список залогов ({@link PledgeFindDto[]} через {@link ResponseDto})
   */
  @Get('active/flat')
  @ResponseDto(PledgeFindDto, {
    isArray: true,
  })
  public findFlat(
    @Query(YupValidationPipe(ActivePledgesFilterDto)) query: ActivePledgesFilterInterface,
  ) {
    return this.pledgeService.findFlat(query);
  }

  /**
   * Превью выкупа
   * @param params - id залога ({@link IdParamInterface})
   * @param query - опциональный момент расчёта ({@link RedeemPledgeQueryInterface})
   * @returns превью; HTTP-тело — {@link RedemptionPreviewDto} через {@link ResponseDto}
   */
  @Get(':id/redemption-preview')
  @ResponseDto(RedemptionPreviewDto)
  public getRedemptionPreview(
    @Param(YupValidationPipe(IdParamDto)) params: IdParamInterface,
    @Query(YupValidationPipe(RedeemPledgeQueryDto)) query: RedeemPledgeQueryInterface,
  ): Promise<RedemptionPreviewInterface> {
    return this.pledgeService.getRedemptionPreview(params.id, query);
  }

  /**
   * Выкуп залога
   * @param params - id залога ({@link IdParamInterface})
   * @param body - опциональный момент выкупа ({@link RedeemPledgeFormInterface})
   * @returns залог; HTTP-тело — {@link PledgeFindDto} через {@link ResponseDto}
   */
  @Post(':id/redeem')
  @ResponseDto(PledgeFindDto)
  public redeemPledge(
    @Param(YupValidationPipe(IdParamDto)) params: IdParamInterface,
    @Body(YupValidationPipe(RedeemPledgeFormDto)) body: RedeemPledgeFormInterface,
  ) {
    return this.pledgeService.redeemPledge(params.id, body);
  }
}
