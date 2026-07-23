import { BadRequestException, type PipeTransform } from '@nestjs/common';
import * as yup from 'yup';

import { formatYupValidationError, type DtoInstanceInterface } from '@shared/dto/dto.class';

/**
 * Nest pipe: парсинг через Dto.parse
 */
export const YupValidationPipe = (dto: DtoInstanceInterface): PipeTransform => {
  return {
    transform: async (value: unknown): Promise<unknown> => {
      try {
        return await dto.parse(value);
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          throw new BadRequestException(formatYupValidationError(error));
        }
        throw error;
      }
    },
  };
};
