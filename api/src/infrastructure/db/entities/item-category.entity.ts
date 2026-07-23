import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { ItemCategoryCharacteristicFieldEntity } from '@infrastructure/db/entities/item-category-characteristic-field.entity';
import { resolveStringColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

@Entity(resolveEntityOptions({
  schema: 'catalog',
  name: 'item_category',
}))
export class ItemCategoryEntity {
  @BigIntPrimaryColumn()
  public id: number;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @DeleteDateColumn()
  public deleted: Date | null;

  @Column({
    type: resolveStringColumnType(),
  })
  public name: string;

  @OneToMany(() => ItemCategoryCharacteristicFieldEntity, field => field.category)
  public characteristicFields: ItemCategoryCharacteristicFieldEntity[];
}
