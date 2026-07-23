import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { isEmpty, isNil, sumBy } from 'lodash-es';
import moment from 'moment-timezone';

import { BaseService } from '@infrastructure/base/base.service';
import { ClientEntity } from '@infrastructure/db/entities/client.entity';
import { PledgeItemCharacteristicValueEntity } from '@infrastructure/db/entities/pledge-item-characteristic-value.entity';
import { PledgeItemEntity } from '@infrastructure/db/entities/pledge-item.entity';
import { PledgeEntity } from '@infrastructure/db/entities/pledge.entity';
import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';
import { isSqljsDatabase } from '@infrastructure/db/helpers/is-sqljs-database.helper';

import { ItemCategoryQueryService } from '@api/modules/catalog/services/item-category-query.service';
import { PledgeQueryService } from '@api/modules/pledge/services/pledge-query.service';
import { RedemptionCalculatorService } from '@api/modules/pledge/services/redemption-calculator.service';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, type PaginationQueryInterface } from '@shared/dto/common/pagination.dto';
import { PledgeStatusEnum } from '@shared/dto/pledge/enums/pledge-status.enum';
import { CharacteristicValueError } from '@shared/lib/characteristic-value';
import { roundMoney } from '@shared/lib/round-money';

import type { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import type { ManagerOptionsInterface } from '@infrastructure/db/interfaces/manager-options.interface';
import type { PaginatedResultInterface } from '@shared/dto/common/paginated-result.dto';
import type { ActivePledgesFilterInterface } from '@shared/dto/pledge/active-pledges-filter.dto';
import type { PledgeFormInterface } from '@shared/dto/pledge/pledge-form.dto';
import type { RedemptionPreviewInterface } from '@shared/dto/pledge/redemption-preview.dto';
import type { EntityManager } from 'typeorm';

/** {@link PledgeService.findMany} */
export interface FindManyOptionsInterface
  extends ManagerOptionsInterface, PaginationQueryInterface, Partial<ActivePledgesFilterInterface> {}

/** {@link PledgeService.findFlat} */
export interface FindFlatOptionsInterface extends ManagerOptionsInterface, Partial<ActivePledgesFilterInterface> {}

/** {@link PledgeService.findOne} */
export type FindOneOptionsInterface = ManagerOptionsInterface;

/** {@link PledgeService.createOne} */
export interface CreateOneParamsInterface extends PledgeFormInterface, ManagerOptionsInterface {}

/** {@link PledgeService.getRedemptionPreview} / {@link PledgeService.redeemPledge} */
export interface RedeemOptionsInterface extends ManagerOptionsInterface {
  /** Дата расчёта: Date или `YYYY-MM-DD` / ISO (как после/до yup) */
  calculationDate?: Date | string;
}

@Injectable()
export class PledgeService extends BaseService {
  @Inject(ItemCategoryQueryService)
  private readonly itemCategoryQueryService: ItemCategoryQueryService;

  @Inject(RedemptionCalculatorService)
  private readonly redemptionCalculatorService: RedemptionCalculatorService;

  @Inject(PledgeQueryService)
  private readonly pledgeQueryService: PledgeQueryService;

  private readonly TAG = 'PledgeService';

  private readonly timeZone = 'Europe/Moscow';

  /**
   * Создание залога с товарами
   * @param params - тариф, клиент, предметы и опциональный manager ({@link CreateOneParamsInterface})
   * @returns созданный залог ({@link PledgeEntity} → {@link PledgeFindDto} на контроллере)
   */
  public createOne = async (params: CreateOneParamsInterface) => {
    if (isEmpty(params.items)) {
      throw new BadRequestException('Нужен хотя бы один товар');
    }

    const run = async (manager: EntityManager): Promise<PledgeEntity> => {
      const tariffRepo = manager.getRepository(TariffEntity);
      const clientRepo = manager.getRepository(ClientEntity);
      const pledgeRepo = manager.getRepository(PledgeEntity);
      const pledgeItemRepo = manager.getRepository(PledgeItemEntity);
      const pledgeItemCharacteristicValueRepo = manager.getRepository(PledgeItemCharacteristicValueEntity);

      const tariff = await tariffRepo.findOne({
        where: {
          id: params.tariff.id,
        },
      });
      if (isNil(tariff)) {
        throw new NotFoundException('Тариф не найден');
      }

      const client = await clientRepo.findOne({
        where: {
          id: params.client.id,
        },
      });
      if (isNil(client)) {
        throw new NotFoundException('Клиент не найден');
      }

      const uniqueCategoryIds = [...new Set(params.items.map(({ category }) => category.id))];

      const categoriesBuilder = this.itemCategoryQueryService.createDetailQueryBuilder({ manager });
      this.itemCategoryQueryService.applyDefaultSorting(categoriesBuilder);

      const categories = await categoriesBuilder
        .where('category.id IN (:...ids)', { ids: uniqueCategoryIds })
        .getMany();

      const categoriesById = new Map(categories.map(category => [category.id, category]));

      uniqueCategoryIds.forEach(categoryId => {
        if (!categoriesById.has(categoryId)) {
          throw new NotFoundException(`Категория не найдена: ${categoryId}`);
        }
      });

      const loanAmount = roundMoney(sumBy(params.items, item => Number(item.appraisalAmount)));
      const createdDate = moment().tz(this.timeZone).startOf('day').toDate();
      const dueDate = moment(createdDate)
        .tz(this.timeZone)
        .add(tariff.basePeriodDays, 'days')
        .startOf('day')
        .toDate();

      const pledge = pledgeRepo.create({
        tariff,
        client,
        createdDate,
        dueDate,
        loanAmount,
        status: PledgeStatusEnum.ACTIVE,
        redeemedAt: null,
        redemptionAmount: null,
      });
      const pledgeSaved = await pledgeRepo.save(pledge);

      for (const item of params.items) {
        const category = categoriesById.get(item.category.id) as ItemCategoryEntity;
        const categoryFields = category.characteristicFields ?? [];
        const fieldsByKey = new Map(categoryFields.map(field => [field.key, field]));

        categoryFields
          .filter(({ required }) => required)
          .forEach(({ key, label }) => {
            if (isNil(item.characteristics[key])) {
              throw new BadRequestException(`Характеристика обязательна: ${label}`);
            }
          });

        const pledgeItem = await pledgeItemRepo.save(
          pledgeItemRepo.create({
            pledge: pledgeSaved,
            category: {
              id: category.id,
            },
            name: item.name,
            appraisalAmount: item.appraisalAmount,
          }),
        );

        const characteristicValues: PledgeItemCharacteristicValueEntity[] = [];

        Object.keys(item.characteristics).forEach(key => {
          const rawValue = item.characteristics[key];
          if (isNil(rawValue)) {
            return;
          }
          const field = fieldsByKey.get(key);
          if (isNil(field)) {
            throw new BadRequestException(`Неизвестная характеристика: ${key}`);
          }
          try {
            const characteristicValue = new PledgeItemCharacteristicValueEntity();
            characteristicValue.pledgeItem = pledgeItem;
            characteristicValue.field = field;
            characteristicValue.typedValue = rawValue;
            characteristicValues.push(characteristicValue);
          } catch (error) {
            if (error instanceof CharacteristicValueError) {
              throw new BadRequestException(`Характеристика «${field.label}»: ${error.message}`);
            }
            throw error;
          }
        });

        if (!isEmpty(characteristicValues)) {
          await pledgeItemCharacteristicValueRepo.save(characteristicValues);
        }
      }

      return pledgeSaved;
    };

    const manager = params.manager || this.databaseService.getManager();

    const savedPledge = await this.sqlHelpersService.runInTransaction(manager, run);

    this.loggerService.info(this.TAG, 'createOne', {
      id: savedPledge.id,
    });

    return this.findOne(savedPledge.id, { manager });
  };

  /**
   * Активные залоги
   * @param options - фильтр по клиенту, пагинация и опциональный manager ({@link FindManyOptionsInterface})
   * @returns страница активных залогов ({@link PaginatedResultInterface} с {@link PledgeEntity})
   */
  public findMany = async (options?: FindManyOptionsInterface): Promise<PaginatedResultInterface<PledgeEntity>> => {
    const manager = options?.manager || this.databaseService.getManager();
    const limit = options?.limit || DEFAULT_LIMIT;
    const offset = options?.offset ?? DEFAULT_OFFSET;

    const builder = this.pledgeQueryService.createSelectQueryBuilder({ manager });
    this.pledgeQueryService.applyFilters(builder, {
      clientId: options?.clientId,
    });

    const [rows, count] = await builder
      .orderBy('pledge.id', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const ids = rows.map(({ id }) => id);
    if (isEmpty(ids)) {
      return {
        items: [],
        count,
        limit,
        offset,
      };
    }

    const items = await this.pledgeQueryService
      .createDetailQueryBuilder({ manager })
      .where('pledge.id IN (:...ids)', { ids })
      .orderBy('pledge.id', 'DESC')
      .addOrderBy('categoryFields.sortOrder', 'ASC')
      .getMany();

    return {
      items,
      count,
      limit,
      offset,
    };
  };

  /**
   * Все активные залоги без пагинации
   * @param options - фильтр по клиенту и опциональный manager ({@link FindFlatOptionsInterface})
   * @returns список активных залогов ({@link PledgeEntity})
   */
  public findFlat = async (options?: FindFlatOptionsInterface): Promise<PledgeEntity[]> => {
    const manager = options?.manager || this.databaseService.getManager();

    const builder = this.pledgeQueryService.createSelectQueryBuilder({ manager });
    this.pledgeQueryService.applyFilters(builder, {
      clientId: options?.clientId,
    });

    const rows = await builder
      .select('pledge.id', 'id')
      .orderBy('pledge.id', 'DESC')
      .getRawMany<{ id: string | number; }>();

    const ids = rows.map(({ id }) => Number(id));
    if (isEmpty(ids)) {
      return [];
    }

    return this.pledgeQueryService
      .createDetailQueryBuilder({ manager })
      .where('pledge.id IN (:...ids)', { ids })
      .orderBy('pledge.id', 'DESC')
      .addOrderBy('categoryFields.sortOrder', 'ASC')
      .getMany();
  };

  /**
   * Превью суммы выкупа
   * @param pledgeId - идентификатор залога
   * @param options - момент расчёта и опциональный manager ({@link RedeemOptionsInterface})
   * @returns расчёт процентов и суммы к выкупу ({@link RedemptionPreviewInterface})
   */
  public getRedemptionPreview = async (pledgeId: number, options?: RedeemOptionsInterface): Promise<RedemptionPreviewInterface> => {
    const pledge = await this.findOneEntity(pledgeId, options);
    if (pledge.status === PledgeStatusEnum.REDEEMED) {
      throw new ConflictException('Залог уже выкуплен');
    }

    return this.redemptionCalculatorService.calculate({
      pledgeId: pledge.id,
      loanAmount: Number(pledge.loanAmount),
      dueDate: pledge.dueDate,
      basePeriodRate: Number(pledge.tariff.basePeriodRate),
      overduePeriodDays: Number(pledge.tariff.overduePeriodDays),
      overdueRate: Number(pledge.tariff.overdueRate),
      calculationDate: options?.calculationDate,
    });
  };

  /**
   * Выкуп залога
   * @param pledgeId - идентификатор залога
   * @param options - момент выкупа и опциональный manager ({@link RedeemOptionsInterface})
   * @returns залог после выкупа ({@link PledgeEntity} → {@link PledgeFindDto} на контроллере)
   */
  public redeemPledge = async (pledgeId: number, options?: RedeemOptionsInterface) => {
    const run = async (manager: EntityManager): Promise<void> => {
      const builder = manager
        .getRepository(PledgeEntity)
        .createQueryBuilder('pledge')
        .leftJoinAndSelect('pledge.tariff', 'tariff')
        .where('pledge.id = :pledgeId', { pledgeId });

      // PG: FOR UPDATE нельзя на nullable-стороне OUTER JOIN — только OF pledge
      if (!isSqljsDatabase()) {
        builder.setLock('pessimistic_write', undefined, ['pledge']);
      }

      const pledge = await builder.getOne();

      if (isNil(pledge)) {
        throw new NotFoundException('Залог не найден');
      }
      if (pledge.status === PledgeStatusEnum.REDEEMED) {
        throw new ConflictException('Залог уже выкуплен');
      }

      const preview = this.redemptionCalculatorService.calculate({
        pledgeId: pledge.id,
        loanAmount: Number(pledge.loanAmount),
        dueDate: pledge.dueDate,
        basePeriodRate: Number(pledge.tariff.basePeriodRate),
        overduePeriodDays: Number(pledge.tariff.overduePeriodDays),
        overdueRate: Number(pledge.tariff.overdueRate),
        calculationDate: options?.calculationDate,
      });

      pledge.status = PledgeStatusEnum.REDEEMED;
      pledge.redeemedAt = isNil(options?.calculationDate)
        ? new Date()
        : new Date(options.calculationDate);
      pledge.redemptionAmount = preview.redemptionAmount;
      await manager.getRepository(PledgeEntity).save(pledge);
    };

    const manager = options?.manager || this.databaseService.getManager();

    await this.sqlHelpersService.runInTransaction(manager, run);

    this.loggerService.info(this.TAG, 'redeemPledge', {
      pledgeId,
    });

    return this.findOne(pledgeId, { manager });
  };

  /**
   * Залог по id
   * @param pledgeId - идентификатор залога
   * @param options - опциональный manager ({@link FindOneOptionsInterface})
   * @returns залог с тарифом, клиентом и предметами ({@link PledgeEntity})
   */
  public findOne = async (pledgeId: number, options?: FindOneOptionsInterface): Promise<PledgeEntity> => {
    return this.findOneEntity(pledgeId, options);
  };

  /**
   * Загрузка entity залога со связями
   * @param pledgeId - идентификатор залога
   * @param options - опциональный manager ({@link ManagerOptionsInterface})
   * @returns entity залога ({@link PledgeEntity})
   */
  private findOneEntity = async (pledgeId: number, options?: ManagerOptionsInterface): Promise<PledgeEntity> => {
    const manager = options?.manager || this.databaseService.getManager();

    const pledge = await this.pledgeQueryService
      .createDetailQueryBuilder({ manager })
      .where('pledge.id = :pledgeId', { pledgeId })
      .orderBy('categoryFields.sortOrder', 'ASC')
      .getOne();

    if (isNil(pledge)) {
      throw new NotFoundException('Залог не найден');
    }

    return pledge;
  };
}
