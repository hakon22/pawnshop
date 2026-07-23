import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { resolveNumericColumnType, resolveStringColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

@Entity(resolveEntityOptions({
  schema: 'catalog',
  name: 'tariff',
}))
export class TariffEntity {
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

  @Column({
    type: 'smallint',
    name: 'base_period_days',
  })
  public basePeriodDays: number;

  @Column({
    type: resolveNumericColumnType(),
    name: 'base_period_rate',
    precision: 10,
    scale: 4,
  })
  public basePeriodRate: number;

  @Column({
    type: 'smallint',
    name: 'overdue_period_days',
  })
  public overduePeriodDays: number;

  @Column({
    type: resolveNumericColumnType(),
    name: 'overdue_rate',
    precision: 10,
    scale: 4,
  })
  public overdueRate: number;
}
