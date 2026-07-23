import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';

import { ResponseDto } from '@infrastructure/validation/response-dto.decorator';
import { YupValidationPipe } from '@infrastructure/validation/yup-validation.pipe';

import { ClientService } from '@api/modules/client/services/client.service';

import { ClientFindDto, type ClientFindInterface } from '@shared/dto/client/client-find.dto';
import { ClientFormDto, type ClientFormInterface } from '@shared/dto/client/client-form.dto';
import { ClientQueryDto, type ClientQueryInterface } from '@shared/dto/client/client-query.dto';

import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';

@Controller('client')
export class ClientController {
  @Inject(ClientService)
  private readonly clientService: ClientService;

  /**
   * Поиск клиентов
   * @param query - поиск и пагинация ({@link ClientQueryInterface})
   * @returns страница клиентов ({@link PaginatedResultInterface} с {@link ClientFindInterface})
   */
  @Get('items')
  @ResponseDto(ClientFindDto, {
    paginated: true,
  })
  public findMany(
    @Query(YupValidationPipe(ClientQueryDto)) query: ClientQueryInterface,
  ): Promise<PaginatedResultInterface<ClientFindInterface>> {
    return this.clientService.findMany(query);
  }

  /**
   * Создание клиента
   * @param body - данные формы ({@link ClientFormInterface})
   * @returns созданный клиент ({@link ClientFindInterface})
   */
  @Post()
  @ResponseDto(ClientFindDto)
  public createOne(
    @Body(YupValidationPipe(ClientFormDto)) body: ClientFormInterface,
  ): Promise<ClientFindInterface> {
    return this.clientService.createOne(body);
  }
}
