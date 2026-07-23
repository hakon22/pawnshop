import { App } from 'antd';
import { debounce, isEmpty } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState, type UIEvent } from 'react';

import { DEFAULT_OFFSET } from '@shared/dto/common/pagination.dto';

import { searchClients } from '@web/entities/client/api/client-api';
import { getApiErrorMessage } from '@web/shared/lib/get-api-error-message';

import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';

const SCROLL_LOAD_THRESHOLD_PX = 24;
const SEARCH_DEBOUNCE_MS = 300;

export interface UseClientSelectModelOptionsInterface {
  /** Загрузить первую страницу при монтировании (по умолчанию true) */
  autoLoad?: boolean;
}

export interface UseClientSelectModelResultInterface {
  items: ClientFindInterface[];
  count: number;
  search: string;
  loading: boolean;
  error: boolean;
  hasMore: boolean;
  onSearch: (nextSearch: string) => void;
  onPopupScroll: (event: UIEvent<HTMLDivElement>) => void;
  prepend: (client: ClientFindInterface) => void;
  reload: () => void;
}

/**
 * Локальная модель ClientSelect: debounce, sequence id, без глобального Redux-кэша поиска.
 * Использует тот же {@link searchClients}, что и API-слой.
 */
export const useClientSelectModel = (options: UseClientSelectModelOptionsInterface = {}): UseClientSelectModelResultInterface => {
  const { autoLoad = true } = options;
  const { message } = App.useApp();

  const [items, setItems] = useState<ClientFindInterface[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const requestIdRef = useRef(0);
  const searchRef = useRef(search);
  const itemsRef = useRef(items);

  searchRef.current = search;
  itemsRef.current = items;

  const load = useCallback(async (params: { search?: string; append?: boolean; } = {}): Promise<void> => {
    const nextSearch = params.search ?? searchRef.current;
    const append = params.append === true;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(false);

    try {
      const page = await searchClients({
        search: nextSearch,
        offset: append ? itemsRef.current.length : DEFAULT_OFFSET,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setSearch(nextSearch);
      setCount(page.count);
      setItems(append ? [...itemsRef.current, ...page.items] : page.items);
    } catch (loadError: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(true);
      message.error(getApiErrorMessage(loadError, 'Не удалось загрузить клиентов'));
      console.error(loadError);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [message]);

  const debouncedLoadSearch = useMemo(() => {
    return debounce((nextSearch: string) => {
      load({
        search: nextSearch,
      }).catch((loadError: unknown) => {
        console.error(loadError);
      });
    }, SEARCH_DEBOUNCE_MS);
  }, [load]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }
    load({
      search: '',
    }).catch((loadError: unknown) => {
      console.error(loadError);
    });
  }, [autoLoad, load]);

  useEffect(() => {
    return () => {
      debouncedLoadSearch.cancel();
      requestIdRef.current += 1;
    };
  }, [debouncedLoadSearch]);

  const onSearch = (nextSearch: string): void => {
    debouncedLoadSearch(nextSearch);
  };

  const onPopupScroll = (event: UIEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLDivElement;
    const hasMore = items.length < count;
    if (!hasMore || loading) {
      return;
    }
    if (target.scrollTop + target.offsetHeight < target.scrollHeight - SCROLL_LOAD_THRESHOLD_PX) {
      return;
    }
    load({
      search,
      append: true,
    }).catch((loadError: unknown) => {
      console.error(loadError);
    });
  };

  const prepend = (client: ClientFindInterface): void => {
    setItems(prev => {
      const exists = prev.some(({ id }) => id === client.id);
      setCount(prevCount => (exists ? prevCount : prevCount + 1));
      return [client, ...prev.filter(({ id }) => id !== client.id)];
    });
  };

  const reload = (): void => {
    load({
      search,
    }).catch((loadError: unknown) => {
      console.error(loadError);
    });
  };

  return {
    items,
    count,
    search,
    loading,
    error,
    hasMore: items.length < count,
    onSearch,
    onPopupScroll,
    prepend,
    reload,
  };
};

export const clientSelectEmptyText = (params: {
  loading: boolean;
  error: boolean;
  search: string;
  itemsEmpty: boolean;
}): string => {
  if (params.loading && params.itemsEmpty) {
    return 'Загрузка…';
  }
  if (params.error) {
    return 'Ошибка загрузки';
  }
  if (isEmpty(params.search)) {
    return 'Клиенты не найдены';
  }
  return 'Ничего не найдено по запросу';
};
