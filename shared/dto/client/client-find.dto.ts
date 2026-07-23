import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { positiveIdSchema } from '@shared/dto/schemas/positive-id.schema';

/** Клиент (чтение) */
export interface ClientFindInterface {
  /** Идентификатор клиента */
  id: number;
  /** Фамилия */
  lastName: string;
  /** Имя */
  firstName: string;
  /** Отчество */
  middleName: string | null;
  /** ФИО целиком */
  fullName: string;
  /** Телефон */
  phone: string;
}

export const ClientFindDto = Dto.create<ClientFindInterface>({
  id: {
    label: 'Идентификатор',
    schema: positiveIdSchema,
  },
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
  fullName: {
    label: 'ФИО',
    schema: yup.string(),
  },
  phone: {
    label: 'Телефон',
    schema: yup.string(),
  },
});
