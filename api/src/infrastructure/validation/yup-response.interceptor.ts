import {
  Inject,
  Injectable,
  InternalServerErrorException,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isNil } from 'lodash-es';
import { map, type Observable } from 'rxjs';
import * as yup from 'yup';

import { RESPONSE_DTO_METADATA_KEY, type ResponseDtoMetadataInterface } from '@infrastructure/validation/response-dto.decorator';

import { formatYupValidationError, type DtoInstanceInterface } from '@shared/dto/dto.class';

/**
 * Маппит тело ответа через Dto.fromEntity, если на хендлере стоит {@link ResponseDto}
 */
@Injectable()
export class YupResponseInterceptor implements NestInterceptor {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  /**
   * Маппит тело ответа через Dto.fromEntity
   * @param context - контекст Nest
   * @param next - следующий обработчик
   * @returns Observable с DTO ответа
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<ResponseDtoMetadataInterface | undefined>(
      RESPONSE_DTO_METADATA_KEY,
      context.getHandler(),
    );

    if (isNil(metadata)) {
      return next.handle();
    }

    const { dto, options } = metadata;

    return next.handle().pipe(
      map(data => this.mapData(data, dto, options.isArray === true, options.paginated === true)),
    );
  }

  /**
   * Применяет fromEntity к данным ответа
   * @param data - тело ответа хендлера
   * @param dto - DTO ответа
   * @param isArrayResponse - ответ — массив
   * @param paginated - ответ — страница с items
   * @returns DTO-данные
   */
  private mapData = (
    data: unknown,
    dto: DtoInstanceInterface,
    isArrayResponse: boolean,
    paginated: boolean,
  ): unknown => {
    try {
      if (paginated) {
        const page = data as {
          items: object[];
          count: number;
          limit: number;
          offset: number;
        };
        return {
          ...page,
          items: (page.items ?? []).map(item => dto.fromEntity(item)),
        };
      }

      if (isArrayResponse) {
        if (!Array.isArray(data)) {
          throw new InternalServerErrorException('Ожидался массив в ответе');
        }
        return data.map(item => dto.fromEntity(item as object));
      }

      return dto.fromEntity(data as object);
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        throw new InternalServerErrorException(formatYupValidationError(error));
      }
      throw error;
    }
  };
}
