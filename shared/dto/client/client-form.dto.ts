import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { phoneSchema } from '@shared/dto/schemas/phone.schema';

/** Клиент (создание / форма) */
export interface ClientFormInterface {
  /** Фамилия */
  lastName: string;
  /** Имя */
  firstName: string;
  /** Отчество */
  middleName?: string;
  /** Телефон (11 цифр, 79…) */
  phone: string;
}

export const ClientFormDto = Dto.create<ClientFormInterface>({
  lastName: {
    label: 'Фамилия',
    schema: yup.string(),
  },
  firstName: {
    label: 'Имя',
    schema: yup.string(),
  },
  middleName: {
    label: 'Отчество',
    optional: true,
    schema: yup.string(),
  },
  phone: {
    label: 'Телефон',
    schema: phoneSchema,
  },
});
