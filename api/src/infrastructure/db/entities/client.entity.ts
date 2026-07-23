import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';

import { BigIntPrimaryColumn } from '@infrastructure/db/decorators/big-int-primary-column.decorator';
import { resolveStringColumnType } from '@infrastructure/db/helpers/resolve-column-type.helper';
import { resolveEntityOptions } from '@infrastructure/db/helpers/resolve-entity-options.helper';

import { formatClientFullName } from '@shared/dto/client/format-client-full-name';

@Entity(resolveEntityOptions({
  schema: 'client',
  name: 'client',
}))
export class ClientEntity {
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
    name: 'last_name',
  })
  public lastName: string;

  @Column({
    type: resolveStringColumnType(),
    name: 'first_name',
  })
  public firstName: string;

  @Column({
    type: resolveStringColumnType(),
    name: 'middle_name',
    nullable: true,
  })
  public middleName: string | null;

  @Column({
    type: resolveStringColumnType(),
  })
  public phone: string;

  /**
   * Составное ФИО
   */
  public get fullName(): string {
    return formatClientFullName(this);
  }
}
