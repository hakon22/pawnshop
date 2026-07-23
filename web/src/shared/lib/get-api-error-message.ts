import axios, { type AxiosError } from 'axios';
import { isArray, isNil, isObject, isString } from 'lodash-es';

interface ApiErrorBodyInterface {
  /** Nest HttpException / AllExceptionsFilter */
  message?: unknown;
  /** am-chokers-style: `{ error: "Name: text" }` */
  error?: unknown;
}

/**
 * Достаёт тело ответа axios (через isAxiosError или duck-typing — на случай dual-package в Vite).
 */
const getAxiosResponseData = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) {
    return error.response?.data;
  }

  if (isObject(error) && 'isAxiosError' in error && (error as AxiosError).isAxiosError === true) {
    return (error as AxiosError).response?.data;
  }

  if (isObject(error) && 'response' in error) {
    return (error as AxiosError).response?.data;
  }

  return undefined;
};

/**
 * Нормализует поле message/error из тела ответа API
 */
const pickErrorText = (value: unknown): string | undefined => {
  if (isString(value) && value.length) {
    return value;
  }

  if (isArray(value) && value.every(isString) && value.length) {
    return value.join('; ');
  }

  return undefined;
};

/**
 * Текст ошибки из ответа API; иначе fallback (сеть / нет response).
 *
 * - Nest HttpException → `message`
 * - AllExceptionsFilter / am-chokers → `error` или `message` с `Name: text`
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const data = getAxiosResponseData(error);

  if (isNil(data)) {
    return fallback;
  }

  if (isString(data) && data.length) {
    return data;
  }

  if (!isObject(data)) {
    return fallback;
  }

  const body = data as ApiErrorBodyInterface;

  return pickErrorText(body.message)
    ?? pickErrorText(body.error)
    ?? fallback;
};
