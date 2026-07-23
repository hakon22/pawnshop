import { useEnsureTariffs } from '@web/entities/catalog/model/use-ensure-catalog';
import { CatalogEntitySelect } from '@web/entities/catalog/ui/catalog-entity-select';

import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';

export interface TariffSelectPropsInterface {
  value?: TariffFindInterface | null;
  onChange?: (tariff: TariffFindInterface) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Select тарифа: ensure через hook + {@link CatalogEntitySelect}
 */
export const TariffSelect = ({
  value,
  onChange,
  className,
  placeholder = 'Выберите тариф',
}: TariffSelectPropsInterface) => {
  const { tariffs, loading } = useEnsureTariffs();

  return (
    <CatalogEntitySelect
      options={tariffs}
      value={value}
      onChange={onChange}
      loading={loading}
      className={className}
      placeholder={placeholder}
    />
  );
};
