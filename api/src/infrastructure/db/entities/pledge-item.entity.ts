import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import { PledgeItemCharacteristicValueEntity } from '@infrastructure/db/entities/pledge-item-characteristic-value.entity';
import { PledgeEntity } from '@infrastructure/db/entities/pledge.entity';
import { resolveNumericColumnType, resolveStringColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

@Entity(resolveEntityOptions({
  schema: 'pledge',
  name: 'pledge_item',
}))
export class PledgeItemEntity {
  @BigIntPrimaryColumn()
  public id: number;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @DeleteDateColumn()
  public deleted: Date | null;

  @Index('pledge_item__pledge_id_idx')
  @ManyToOne(() => PledgeEntity, pledge => pledge.items)
  @JoinColumn({
    name: 'pledge_id',
  })
  public pledge: PledgeEntity;

  @Index('pledge_item__category_id_idx')
  @ManyToOne(() => ItemCategoryEntity)
  @JoinColumn({
    name: 'category_id',
  })
  public category: ItemCategoryEntity;

  @Column({
    type: resolveStringColumnType(),
  })
  public name: string;

  @OneToMany(() => PledgeItemCharacteristicValueEntity, value => value.pledgeItem)
  public characteristicValues: PledgeItemCharacteristicValueEntity[];

  @Column({
    type: resolveNumericColumnType(),
    name: 'appraisal_amount',
    precision: 14,
    scale: 2,
  })
  public appraisalAmount: number;

  /**
   * Характеристики предмета: key → типизированное значение
   */
  public get characteristics(): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = {};
    (this.characteristicValues ?? []).forEach(row => {
      result[row.field.key] = row.typedValue;
    });
    return result;
  }
}
