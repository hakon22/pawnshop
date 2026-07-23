import { Select } from 'antd';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo, type UIEvent } from 'react';

import { clientSelectEmptyText } from '@web/entities/client/model/use-client-select-model';

import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';

export interface ClientSelectPropsInterface {
  value?: ClientFindInterface | null;
  onChange?: (client: ClientFindInterface) => void;
  className?: string;
  placeholder?: string;
  items: ClientFindInterface[];
  search: string;
  loading: boolean;
  error: boolean;
  onSearch: (nextSearch: string) => void;
  onPopupScroll: (event: UIEvent<HTMLDivElement>) => void;
}

const clientOptionLabel = (client: ClientFindInterface): string => {
  return `${client.fullName} (${client.phone})`;
};

/**
 * Презентационный Select клиентов (данные — из {@link useClientSelectModel})
 */
export const ClientSelect = ({
  value,
  onChange,
  className,
  placeholder = 'Поиск по ФИО / телефону',
  items,
  search,
  loading,
  error,
  onSearch,
  onPopupScroll,
}: ClientSelectPropsInterface) => {
  const optionsSource = useMemo(() => {
    if (isNil(value) || items.some(({ id }) => id === value.id)) {
      return items;
    }
    return [value, ...items];
  }, [items, value]);

  const handleChange = (clientId: number): void => {
    const next = optionsSource.find(({ id }) => id === clientId);
    if (!isNil(next)) {
      onChange?.(next);
    }
  };

  return (
    <Select
      className={className}
      showSearch={{
        filterOption: false,
        onSearch,
      }}
      placeholder={placeholder}
      value={isNil(value) ? undefined : value.id}
      options={optionsSource.map(client => ({
        value: client.id,
        label: clientOptionLabel(client),
      }))}
      onChange={handleChange}
      onPopupScroll={onPopupScroll}
      loading={loading && isEmpty(items)}
      notFoundContent={clientSelectEmptyText({
        loading,
        error,
        search,
        itemsEmpty: isEmpty(items),
      })}
      aria-label={placeholder}
    />
  );
};
