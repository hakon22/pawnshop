import { SetMetadata } from '@nestjs/common';

import type { DtoInstanceInterface } from '@shared/dto/dto.class';

export const RESPONSE_DTO_METADATA_KEY = 'response_dto';

export interface ResponseDtoOptionsInterface {
  /** Ответ — массив элементов DTO */
  isArray?: boolean;
  /** Ответ — {@link PaginatedResultInterface} с items: DTO[] */
  paginated?: boolean;
}

export interface ResponseDtoMetadataInterface {
  dto: DtoInstanceInterface;
  options: ResponseDtoOptionsInterface;
}

/**
 * Указывает DTO ответа: interceptor прогонит fromEntity на выходе хендлера
 */
export const ResponseDto = (
  dto: DtoInstanceInterface,
  options: ResponseDtoOptionsInterface = {},
): MethodDecorator => {
  return SetMetadata(RESPONSE_DTO_METADATA_KEY, {
    dto,
    options,
  } satisfies ResponseDtoMetadataInterface);
};
