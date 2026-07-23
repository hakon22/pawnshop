import { useEnsureCategories } from '@web/entities/catalog/model/use-ensure-catalog';
import { CatalogEntitySelect } from '@web/entities/catalog/ui/catalog-entity-select';

import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';

export interface ItemCategorySelectPropsInterface {
  value?: ItemCategoryFindInterface | null;
  onChange?: (category: ItemCategoryFindInterface) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Select категории: ensure через hook + {@link CatalogEntitySelect}
 */
export const ItemCategorySelect = ({
  value,
  onChange,
  className,
  placeholder = 'Выберите категорию',
}: ItemCategorySelectPropsInterface) => {
  const { categories, loading } = useEnsureCategories();

  return (
    <CatalogEntitySelect
      options={categories}
      value={value}
      onChange={onChange}
      loading={loading}
      className={className}
      placeholder={placeholder}
      optionLabel={category => category.name || `Категория №${category.id}`}
    />
  );
};
