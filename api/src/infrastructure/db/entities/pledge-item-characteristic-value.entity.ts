import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { ItemCategoryCharacteristicFieldEntity } from '@infrastructure/db/entities/item-category-characteristic-field.entity';
import { PledgeItemEntity } from '@infrastructure/db/entities/pledge-item.entity';
import { resolveStringColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

import { deserializeCharacteristicValue, serializeCharacteristicValue } from '@shared/lib/characteristic-value';

@Entity(resolveEntityOptions({
  schema: 'pledge',
  name: 'pledge_item_characteristic_value',
}))
export class PledgeItemCharacteristicValueEntity {
  @BigIntPrimaryColumn()
  public id: number;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @DeleteDateColumn()
  public deleted: Date | null;

  @Index('pledge_item_characteristic_value__pledge_item_id_idx')
  @ManyToOne(() => PledgeItemEntity, item => item.characteristicValues)
  @JoinColumn({
    name: 'pledge_item_id',
  })
  public pledgeItem: PledgeItemEntity;

  @Index('pledge_item_characteristic_value__field_id_idx')
  @ManyToOne(() => ItemCategoryCharacteristicFieldEntity)
  @JoinColumn({
    name: 'field_id',
  })
  public field: ItemCategoryCharacteristicFieldEntity;

  /** Строковое представление в БД */
  @Column({
    type: resolveStringColumnType(),
  })
  public value: string;

  /**
   * Типизированное значение (сериализация/десериализация по {@link field.type})
   */
  public get typedValue(): string | number | boolean {
    return deserializeCharacteristicValue(this.field.type, this.value);
  }

  public set typedValue(value: string | number | boolean) {
    this.value = serializeCharacteristicValue(this.field.type, value);
  }
}
