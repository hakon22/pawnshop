import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { EnumColumn } from '@infrastructure/db/decorators/enum-column.decorator';
import { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import { resolveStringColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

import { CharacteristicFieldTypeEnum } from '@shared/dto/catalog/enums/characteristic-field-type.enum';

@Entity(resolveEntityOptions({
  schema: 'catalog',
  name: 'item_category_characteristic_field',
}))
export class ItemCategoryCharacteristicFieldEntity {
  @BigIntPrimaryColumn()
  public id: number;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @DeleteDateColumn()
  public deleted: Date | null;

  @Index('item_category_characteristic_field__category_id_idx')
  @ManyToOne(() => ItemCategoryEntity, category => category.characteristicFields)
  @JoinColumn({
    name: 'category_id',
  })
  public category: ItemCategoryEntity;

  @Column({
    type: resolveStringColumnType(),
  })
  public key: string;

  @Column({
    type: resolveStringColumnType(),
  })
  public label: string;

  @EnumColumn({
    enum: CharacteristicFieldTypeEnum,
    enumName: 'characteristic_field_type_enum',
    enumSchema: 'catalog',
  })
  public type: CharacteristicFieldTypeEnum;

  @Column({
    type: 'boolean',
    default: false,
  })
  public required: boolean;

  @Column({
    type: 'smallint',
    name: 'sort_order',
    default: 0,
  })
  public sortOrder: number;
}
