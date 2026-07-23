import { ClientEntity } from '@infrastructure/db/entities/client.entity';
import { ItemCategoryCharacteristicFieldEntity } from '@infrastructure/db/entities/item-category-characteristic-field.entity';
import { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import { PledgeItemCharacteristicValueEntity } from '@infrastructure/db/entities/pledge-item-characteristic-value.entity';
import { PledgeItemEntity } from '@infrastructure/db/entities/pledge-item.entity';
import { PledgeEntity } from '@infrastructure/db/entities/pledge.entity';
import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';

export const entities = [
  TariffEntity,
  ItemCategoryEntity,
  ItemCategoryCharacteristicFieldEntity,
  ClientEntity,
  PledgeEntity,
  PledgeItemEntity,
  PledgeItemCharacteristicValueEntity,
];
