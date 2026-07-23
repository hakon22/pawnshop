import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, UpdateDateColumn } from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { EnumColumn } from '@infrastructure/db/decorators/enum-column.decorator';
import { ClientEntity } from '@infrastructure/db/entities/client.entity';
import { PledgeItemEntity } from '@infrastructure/db/entities/pledge-item.entity';
import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';
import { resolveDateTimeColumnType, resolveNumericColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

import { PledgeStatusEnum } from '@shared/dto/pledge/enums/pledge-status.enum';

@Entity(resolveEntityOptions({
  schema: 'pledge',
  name: 'pledge',
}))
export class PledgeEntity {
  @BigIntPrimaryColumn()
  public id: number;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @DeleteDateColumn()
  public deleted: Date | null;

  @Index('pledge__tariff_id_idx')
  @ManyToOne(() => TariffEntity)
  @JoinColumn({
    name: 'tariff_id',
  })
  public tariff: TariffEntity;

  @Index('pledge__client_id_idx')
  @ManyToOne(() => ClientEntity)
  @JoinColumn({
    name: 'client_id',
  })
  public client: ClientEntity;

  @Column({
    type: resolveDateTimeColumnType(),
    name: 'created_date',
  })
  public createdDate: Date;

  @Column({
    type: resolveDateTimeColumnType(),
    name: 'due_date',
  })
  public dueDate: Date;

  @Column({
    type: resolveNumericColumnType(),
    name: 'loan_amount',
    precision: 14,
    scale: 2,
  })
  public loanAmount: number;

  @EnumColumn({
    enum: PledgeStatusEnum,
    enumName: 'pledge_status_enum',
    enumSchema: 'pledge',
    default: PledgeStatusEnum.ACTIVE,
  })
  public status: PledgeStatusEnum;

  @Column({
    type: resolveDateTimeColumnType(),
    name: 'redeemed_at',
    nullable: true,
  })
  public redeemedAt: Date | null;

  @Column({
    type: resolveNumericColumnType(),
    name: 'redemption_amount',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  public redemptionAmount: number | null;

  @OneToMany(() => PledgeItemEntity, item => item.pledge)
  public items: PledgeItemEntity[];
}
