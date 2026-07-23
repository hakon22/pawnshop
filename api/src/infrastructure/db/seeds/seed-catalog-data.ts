
import { ClientEntity } from '@infrastructure/db/entities/client.entity';
import { ItemCategoryCharacteristicFieldEntity } from '@infrastructure/db/entities/item-category-characteristic-field.entity';
import { ItemCategoryEntity } from '@infrastructure/db/entities/item-category.entity';
import { TariffEntity } from '@infrastructure/db/entities/tariff.entity';

import { CharacteristicFieldTypeEnum } from '@shared/dto/catalog/enums/characteristic-field-type.enum';

import type { EntityManager } from 'typeorm';

/**
 * Сиды справочников: 5 тарифов, 5 категорий, 5 клиентов
 */
export const seedCatalogData = async (manager: EntityManager): Promise<void> => {
  await manager.transaction(async transactionalManager => {
    const tariffRepository = transactionalManager.getRepository(TariffEntity);
    const categoryRepository = transactionalManager.getRepository(ItemCategoryEntity);
    const fieldRepository = transactionalManager.getRepository(ItemCategoryCharacteristicFieldEntity);
    const clientRepository = transactionalManager.getRepository(ClientEntity);

    const tariffCount = await tariffRepository.count();
    if (tariffCount === 0) {
      await tariffRepository.save([
        {
          name: 'Техника 5 дней 2,158%',
          basePeriodDays: 5,
          basePeriodRate: 2.158,
          overduePeriodDays: 1,
          overdueRate: 0.5,
        },
        {
          name: 'Техника 10 дней 3,5% (просрочка/2 дн.)',
          basePeriodDays: 10,
          basePeriodRate: 3.5,
          overduePeriodDays: 2,
          overdueRate: 0.4,
        },
        {
          name: 'Ювелирка 7 дней 2,8% (просрочка/3 дн.)',
          basePeriodDays: 7,
          basePeriodRate: 2.8,
          overduePeriodDays: 3,
          overdueRate: 0.55,
        },
        {
          name: 'Электроника 14 дней 4,2% (просрочка/7 дн.)',
          basePeriodDays: 14,
          basePeriodRate: 4.2,
          overduePeriodDays: 7,
          overdueRate: 0.35,
        },
        {
          name: 'Быстрый 3 дня 1,9%',
          basePeriodDays: 3,
          basePeriodRate: 1.9,
          overduePeriodDays: 1,
          overdueRate: 0.7,
        },
      ]);
    }

    const categoryCount = await categoryRepository.count();
    if (categoryCount === 0) {
      const categories = await categoryRepository.save([
        {
          name: 'Смартфоны',
        },
        {
          name: 'Мониторы',
        },
        {
          name: 'Ноутбуки',
        },
        {
          name: 'Планшеты',
        },
        {
          name: 'Часы',
        },
      ]);

      await fieldRepository.save([
        {
          category: categories[0],
          key: 'model',
          label: 'Модель',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 0,
        },
        {
          category: categories[0],
          key: 'memoryGb',
          label: 'Объём памяти (ГБ)',
          type: CharacteristicFieldTypeEnum.NUMBER,
          required: true,
          sortOrder: 1,
        },
        {
          category: categories[0],
          key: 'screenCondition',
          label: 'Состояние экрана',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 2,
        },
        {
          category: categories[1],
          key: 'diagonal',
          label: 'Диагональ',
          type: CharacteristicFieldTypeEnum.NUMBER,
          required: true,
          sortOrder: 0,
        },
        {
          category: categories[1],
          key: 'resolution',
          label: 'Разрешение',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 1,
        },
        {
          category: categories[1],
          key: 'hasScratches',
          label: 'Есть царапины',
          type: CharacteristicFieldTypeEnum.BOOLEAN,
          required: true,
          sortOrder: 2,
        },
        {
          category: categories[2],
          key: 'model',
          label: 'Модель',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 0,
        },
        {
          category: categories[2],
          key: 'ramGb',
          label: 'ОЗУ (ГБ)',
          type: CharacteristicFieldTypeEnum.NUMBER,
          required: true,
          sortOrder: 1,
        },
        {
          category: categories[2],
          key: 'ssdGb',
          label: 'SSD (ГБ)',
          type: CharacteristicFieldTypeEnum.NUMBER,
          required: true,
          sortOrder: 2,
        },
        {
          category: categories[3],
          key: 'model',
          label: 'Модель',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 0,
        },
        {
          category: categories[3],
          key: 'screenSize',
          label: 'Диагональ экрана',
          type: CharacteristicFieldTypeEnum.NUMBER,
          required: true,
          sortOrder: 1,
        },
        {
          category: categories[4],
          key: 'brand',
          label: 'Бренд',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 0,
        },
        {
          category: categories[4],
          key: 'material',
          label: 'Материал',
          type: CharacteristicFieldTypeEnum.STRING,
          required: true,
          sortOrder: 1,
        },
        {
          category: categories[4],
          key: 'hasBox',
          label: 'Есть коробка',
          type: CharacteristicFieldTypeEnum.BOOLEAN,
          required: false,
          sortOrder: 2,
        },
      ]);
    }

    const clientCount = await clientRepository.count();
    if (clientCount === 0) {
      await clientRepository.save([
        {
          lastName: 'Иванов',
          firstName: 'Иван',
          middleName: 'Иванович',
          phone: '79001112233',
        },
        {
          lastName: 'Петрова',
          firstName: 'Анна',
          middleName: 'Сергеевна',
          phone: '79002223344',
        },
        {
          lastName: 'Сидоров',
          firstName: 'Пётр',
          middleName: 'Алексеевич',
          phone: '79003334455',
        },
        {
          lastName: 'Козлова',
          firstName: 'Мария',
          middleName: 'Викторовна',
          phone: '79004445566',
        },
        {
          lastName: 'Новиков',
          firstName: 'Дмитрий',
          middleName: 'Игоревич',
          phone: '79005556677',
        },
      ]);
    }
  });
};
