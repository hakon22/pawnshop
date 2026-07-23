import { App } from 'antd';
import { useEffect, useRef } from 'react';

import { ensureCategoriesLoaded, ensureTariffsLoaded } from '@web/entities/catalog/model/catalog-slice';
import { getApiErrorMessage } from '@web/shared/lib/get-api-error-message';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';

/**
 * Загружает тарифы при mount / idle; один retry-цикл после error на mount instance
 */
export const useEnsureTariffs = (): { tariffs: TariffFindInterface[]; loading: boolean; } => {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const tariffs = useAppSelector(state => state.catalog.tariffs);
  const tariffsStatus = useAppSelector(state => state.catalog.tariffsStatus);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (tariffsStatus === 'loaded' || tariffsStatus === 'loading') {
      return;
    }
    if (tariffsStatus === 'error' && attemptedRef.current) {
      return;
    }
    attemptedRef.current = true;
    dispatch(ensureTariffsLoaded())
      // unwrap - разворачивает thunk в Promise
      .unwrap()
      .catch((error: unknown) => {
        message.error(getApiErrorMessage(error, 'Не удалось загрузить тарифы'));
        console.error(error);
      });
  }, [dispatch, message, tariffsStatus]);

  return {
    tariffs,
    loading: tariffsStatus === 'loading' || tariffsStatus === 'idle',
  };
};

/**
 * Загружает категории при mount / idle; один retry-цикл после error на mount instance
 */
export const useEnsureCategories = (): { categories: ItemCategoryFindInterface[]; loading: boolean; } => {
  const { message } = App.useApp();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(state => state.catalog.categories);
  const categoriesStatus = useAppSelector(state => state.catalog.categoriesStatus);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (categoriesStatus === 'loaded' || categoriesStatus === 'loading') {
      return;
    }
    if (categoriesStatus === 'error' && attemptedRef.current) {
      return;
    }
    attemptedRef.current = true;
    dispatch(ensureCategoriesLoaded())
      // unwrap - разворачивает thunk в Promise
      .unwrap()
      .catch((error: unknown) => {
        message.error(getApiErrorMessage(error, 'Не удалось загрузить категории'));
        console.error(error);
      });
  }, [categoriesStatus, dispatch, message]);

  return {
    categories,
    loading: categoriesStatus === 'loading' || categoriesStatus === 'idle',
  };
};
