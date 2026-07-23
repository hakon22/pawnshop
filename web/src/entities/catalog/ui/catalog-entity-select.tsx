import { Select } from 'antd';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

export interface CatalogEntityOptionInterface {
  id: number;
  name: string;
}

export interface CatalogEntitySelectPropsInterface<T extends CatalogEntityOptionInterface> {
  options: T[];
  value?: T | null;
  onChange?: (item: T) => void;
  loading?: boolean;
  className?: string;
  placeholder?: string;
  optionLabel?: (item: T) => string;
}

export const CatalogEntitySelect = <T extends CatalogEntityOptionInterface>({
  options,
  value,
  onChange,
  loading = false,
  className,
  placeholder,
  optionLabel = (item: T) => item.name,
}: CatalogEntitySelectPropsInterface<T>) => {
  const optionsSource = useMemo(() => {
    if (isNil(value) || options.some(({ id }) => id === value.id)) {
      return options;
    }
    return [value, ...options];
  }, [options, value]);

  const handleChange = (id: number): void => {
    const next = optionsSource.find(item => item.id === id);
    if (!isNil(next)) {
      onChange?.(next);
    }
  };

  return (
    <Select
      className={className}
      placeholder={placeholder}
      value={isNil(value) ? undefined : value.id}
      loading={loading}
      options={optionsSource.map(item => ({
        value: item.id,
        label: optionLabel(item),
      }))}
      onChange={handleChange}
    />
  );
};
