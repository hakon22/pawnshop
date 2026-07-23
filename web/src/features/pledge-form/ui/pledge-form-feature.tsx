import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, App, Button, Card, Form, Input, InputNumber, Space, Steps, Switch, Typography } from 'antd';
import { entries, isBoolean, isEmpty, isNil, isNumber, sumBy } from 'lodash-es';
import moment from 'moment-timezone';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CharacteristicFieldTypeEnum } from '@shared/dto/catalog/enums/characteristic-field-type.enum';
import { ClientFormDto, type ClientFormInterface } from '@shared/dto/client/client-form.dto';
import { PledgeItemFormDto, type PledgeItemFormInterface } from '@shared/dto/pledge/pledge-item-form.dto';

import { ItemCategorySelect, TariffSelect } from '@web/entities/catalog';
import { ClientSelect, createClient, useClientSelectModel } from '@web/entities/client';
import { createPledge } from '@web/entities/pledge';
import { resetPledgeForm, setClient, setItems, setTariff } from '@web/features/pledge-form/model/pledge-form-slice';
import { formatMoney } from '@web/shared/lib/format-money';
import { getApiErrorMessage } from '@web/shared/lib/get-api-error-message';
import { dtoFormItemProps } from '@web/shared/lib/yup-dto-field-rules';
import { EmptyPlaceholder } from '@web/shared/ui/empty-placeholder';
import { PageHeader } from '@web/shared/ui/page-header';
import { PhoneInput } from '@web/shared/ui/phone-input';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import type { PledgeFormInterface } from '@shared/dto/pledge/pledge-form.dto';

const { Title, Text } = Typography;

const PLEDGE_STEPS = [
  { title: 'Тариф' },
  { title: 'Товары' },
  { title: 'Клиент' },
] as const;

const formatCharacteristicValue = (value: string | number | boolean): string => {
  if (isBoolean(value)) {
    return value ? 'да' : 'нет';
  }
  return String(value);
};

export const PledgeFormFeature = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tariff, client, items } = useAppSelector(state => state.pledgeForm);
  const categories = useAppSelector(state => state.catalog.categories);
  const clientsSelect = useClientSelectModel();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategoryFindInterface | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [itemForm] = Form.useForm();
  const [clientForm] = Form.useForm();

  const resolveCategory = (categoryId: number): ItemCategoryFindInterface | null => {
    return categories.find(({ id }) => id === categoryId)
      ?? (selectedCategory?.id === categoryId ? selectedCategory : null);
  };

  const dueDatePreview = useMemo(() => {
    if (isNil(tariff)) {
      return null;
    }
    return moment()
      .tz('Europe/Moscow')
      .startOf('day')
      .add(tariff.basePeriodDays, 'days')
      .format('DD.MM.YYYY');
  }, [tariff]);

  const loanTotal = sumBy(items, item => Number(item.appraisalAmount));

  const getCharacteristicLabel = (categoryId: number, key: string): string => {
    const field = resolveCategory(categoryId)?.characteristicFields.find(item => item.key === key);
    return field?.label ?? key;
  };

  const resetItemEditor = (): void => {
    setEditingIndex(null);
    itemForm.resetFields();
    setSelectedCategory(null);
  };

  const handleSaveItem = async (): Promise<void> => {
    const values = await itemForm.validateFields();
    const characteristics: Record<string, string | number | boolean> = {};
    const category = resolveCategory(values.category.id) ?? selectedCategory;

    (category?.characteristicFields ?? []).forEach(field => {
      const rawValue = values[field.key];
      if (isNil(rawValue)) {
        return;
      }
      characteristics[field.key] = rawValue;
    });

    const nextItem: PledgeItemFormInterface = {
      category: values.category,
      name: values.name,
      characteristics,
      appraisalAmount: values.appraisalAmount,
    };

    if (isNumber(editingIndex)) {
      const nextItems = [...items];
      nextItems[editingIndex] = nextItem;
      dispatch(setItems(nextItems));
    } else {
      dispatch(setItems([...items, nextItem]));
    }

    resetItemEditor();
    setStepError(null);
  };

  const handleRemoveItem = (index: number): void => {
    if (editingIndex === index) {
      resetItemEditor();
    } else if (isNumber(editingIndex) && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
    dispatch(setItems(items.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleEditItem = (index: number): void => {
    const item = items[index];
    if (isNil(item)) {
      return;
    }

    const cachedCategory = resolveCategory(item.category.id);
    if (!isNil(cachedCategory)) {
      setSelectedCategory(cachedCategory);
    }

    setEditingIndex(index);
    itemForm.setFieldsValue({
      category: item.category,
      name: item.name,
      appraisalAmount: item.appraisalAmount,
      ...item.characteristics,
    });
  };

  const handleCreateClient = async (): Promise<void> => {
    const values: ClientFormInterface = await clientForm.validateFields();
    setCreatingClient(true);
    try {
      const created = await createClient(values);
      clientsSelect.prepend(created);
      dispatch(setClient(created));
      clientForm.resetFields();
      setShowCreateClient(false);
      setStepError(null);
      message.success('Клиент создан');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось создать клиента'));
      console.error(error);
    } finally {
      setCreatingClient(false);
    }
  };

  const validateStep = (step: number): string | null => {
    if (step === 0 && isNil(tariff)) {
      return 'Выберите тариф, чтобы продолжить';
    }
    if (step === 1 && isEmpty(items)) {
      return 'Добавьте хотя бы один товар';
    }
    if (step === 2 && isNil(client)) {
      return 'Выберите или создайте клиента';
    }
    return null;
  };

  const handleNext = (): void => {
    const error = validateStep(currentStep);
    if (!isNil(error)) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setCurrentStep(step => Math.min(step + 1, PLEDGE_STEPS.length - 1));
  };

  const handleBack = (): void => {
    setStepError(null);
    setCurrentStep(step => Math.max(step - 1, 0));
  };

  const handleSubmit = async (): Promise<void> => {
    const error = validateStep(2);
    if (!isNil(error) || isNil(tariff) || isNil(client) || isEmpty(items)) {
      setStepError(error ?? 'Выберите тариф, клиента и добавьте товары');
      return;
    }

    setSaving(true);
    try {
      const payload: PledgeFormInterface = {
        tariff: {
          id: tariff.id,
        },
        client: {
          id: client.id,
        },
        items,
      };
      const pledge = await createPledge(payload);
      message.success({
        content: (
          <span>
            {`Залог №${pledge.id} создан. `}
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-inherit underline"
              onClick={() => {
                message.destroy();
                navigate('/redemptions');
              }}
            >
              К выкупу
            </button>
          </span>
        ),
        duration: 5,
      });
      dispatch(resetPledgeForm());
      resetItemEditor();
      setCurrentStep(0);
      setStepError(null);
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Ошибка сохранения залога'));
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6">
      <PageHeader
        title="Создание залога"
        description="Пошагово: тариф, товары с характеристиками и контрагент."
      />

      <Steps
        current={currentStep}
        items={[...PLEDGE_STEPS]}
        onChange={nextStep => {
          if (nextStep < currentStep) {
            setStepError(null);
            setCurrentStep(nextStep);
            return;
          }
          for (let step = currentStep; step < nextStep; step += 1) {
            const error = validateStep(step);
            if (!isNil(error)) {
              setStepError(error);
              setCurrentStep(step);
              return;
            }
          }
          setStepError(null);
          setCurrentStep(nextStep);
        }}
      />

      {!isNil(stepError) && (
        <Alert type="warning" showIcon message={stepError} />
      )}

      {currentStep === 0 && (
        <Card title="Тариф" className="ui-fade-in">
          <Form layout="vertical">
            <Form.Item label="Тариф" required>
              <TariffSelect
                className="w-full"
                value={tariff}
                onChange={next => {
                  dispatch(setTariff(next));
                  setStepError(null);
                }}
              />
            </Form.Item>
          </Form>
          {!isNil(tariff) && (
            <div className="mt-2 grid gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 text-sm">
              <Text>
                Дата «до»:
                {' '}
                <strong>{dueDatePreview}</strong>
              </Text>
              <Text>
                % за основной период:
                {' '}
                <strong>{tariff.basePeriodRate}</strong>
              </Text>
              <Text>
                % за просрочку (в день):
                {' '}
                <strong>{tariff.overdueRate}</strong>
                {' '}
                (период
                {' '}
                {tariff.overduePeriodDays}
                {' '}
                дн.)
              </Text>
            </div>
          )}
        </Card>
      )}

      {currentStep === 1 && (
        <Card title="Товары" className="ui-fade-in">
          <Form form={itemForm} layout="vertical">
            <Form.Item
              name="category"
              {...dtoFormItemProps(PledgeItemFormDto, 'category')}
              getValueFromEvent={(category: ItemCategoryFindInterface) => ({
                id: category.id,
              })}
              getValueProps={(category: { id: number; } | undefined) => ({
                value: isNil(category) ? null : resolveCategory(category.id),
              })}
            >
              <ItemCategorySelect
                onChange={category => {
                  const previousKeys = (selectedCategory?.characteristicFields ?? []).map(field => field.key);
                  if (!isEmpty(previousKeys)) {
                    itemForm.resetFields(previousKeys);
                  }
                  setSelectedCategory(category);
                }}
              />
            </Form.Item>
            <Form.Item
              name="name"
              {...dtoFormItemProps(PledgeItemFormDto, 'name')}
            >
              <Input />
            </Form.Item>
            {(selectedCategory?.characteristicFields ?? []).map(field => (
              <Form.Item
                key={field.key}
                name={field.key}
                label={field.label}
                valuePropName={field.type === CharacteristicFieldTypeEnum.BOOLEAN ? 'checked' : 'value'}
                rules={field.required === true
                  ? field.type === CharacteristicFieldTypeEnum.BOOLEAN
                    ? [
                      {
                        validator: async (_, value: unknown) => {
                          if (value === true || value === false) {
                            return;
                          }
                          throw new Error(`${field.label} обязательно`);
                        },
                      },
                    ]
                    : [
                      {
                        required: true,
                        message: `${field.label} обязательно`,
                      },
                    ]
                  : undefined}
              >
                {field.type === CharacteristicFieldTypeEnum.BOOLEAN && <Switch />}
                {field.type === CharacteristicFieldTypeEnum.NUMBER && <InputNumber className="w-full" />}
                {field.type === CharacteristicFieldTypeEnum.STRING && <Input />}
              </Form.Item>
            ))}
            <Form.Item
              name="appraisalAmount"
              {...dtoFormItemProps(PledgeItemFormDto, 'appraisalAmount')}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Space wrap>
              <Button
                type="primary"
                title={isNumber(editingIndex) ? 'Сохранить товар' : 'Добавить товар'}
                onClick={handleSaveItem}
              >
                {isNumber(editingIndex) ? 'Сохранить товар' : 'Добавить товар'}
              </Button>
              {isNumber(editingIndex) && (
                <Button title="Отмена" onClick={resetItemEditor}>
                  Отмена
                </Button>
              )}
            </Space>
          </Form>

          <div className="mt-6">
            {isEmpty(items) ? (
              <EmptyPlaceholder description="Добавьте первый товар в залог" />
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className={`rounded-lg border p-3 ${
                      editingIndex === index
                        ? 'border-[var(--color-primary)] bg-[var(--color-bg)]'
                        : 'border-[var(--color-border)] bg-[var(--color-panel)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Text strong>
                          {item.name}
                          {' '}
                          —
                          {' '}
                          {formatMoney(item.appraisalAmount)}
                        </Text>
                        {!isEmpty(item.characteristics) && (
                          <div className="mt-2 grid gap-1 text-sm text-[var(--color-muted)]">
                            {entries(item.characteristics).map(([key, value]) => (
                              <Text key={key} type="secondary">
                                {getCharacteristicLabel(item.category.id, key)}
                                :
                                {' '}
                                {formatCharacteristicValue(value)}
                              </Text>
                            ))}
                          </div>
                        )}
                      </div>
                      <Space>
                        <Button type="link" title="Править" onClick={() => handleEditItem(index)}>
                          Править
                        </Button>
                        <Button type="link" danger title="Удалить" onClick={() => handleRemoveItem(index)}>
                          Удалить
                        </Button>
                      </Space>
                    </div>
                  </div>
                ))}
                <Text className="!mt-3 block">
                  Сумма займа:
                  {' '}
                  <strong className="text-[var(--color-accent)]">
                    {formatMoney(loanTotal)}
                  </strong>
                </Text>
              </div>
            )}
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card title="Контрагент" className="ui-fade-in">
          <Form layout="vertical">
            <Form.Item label="Клиент" required>
              <div className="flex gap-2">
                <ClientSelect
                  className="min-w-0 flex-1"
                  value={client}
                  onChange={next => {
                    dispatch(setClient(next));
                    setStepError(null);
                  }}
                  items={clientsSelect.items}
                  search={clientsSelect.search}
                  loading={clientsSelect.loading}
                  error={clientsSelect.error}
                  onSearch={clientsSelect.onSearch}
                  onPopupScroll={clientsSelect.onPopupScroll}
                />
                <Button
                  icon={showCreateClient ? <MinusOutlined /> : <PlusOutlined />}
                  title={showCreateClient ? 'Скрыть форму нового клиента' : 'Создать нового клиента'}
                  aria-label={showCreateClient ? 'Скрыть форму нового клиента' : 'Создать нового клиента'}
                  onClick={() => {
                    setShowCreateClient(open => {
                      if (open) {
                        clientForm.resetFields();
                      }
                      return !open;
                    });
                  }}
                />
              </div>
            </Form.Item>
          </Form>

          {showCreateClient && (
            <>
              <Title level={5} className="!mt-2">
                Новый клиент
              </Title>
              <Form form={clientForm} layout="vertical" className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
                <Form.Item
                  name="lastName"
                  {...dtoFormItemProps(ClientFormDto, 'lastName')}
                >
                  <Input autoComplete="family-name" />
                </Form.Item>
                <Form.Item
                  name="firstName"
                  {...dtoFormItemProps(ClientFormDto, 'firstName')}
                >
                  <Input autoComplete="given-name" />
                </Form.Item>
                <Form.Item
                  name="middleName"
                  {...dtoFormItemProps(ClientFormDto, 'middleName')}
                >
                  <Input autoComplete="additional-name" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  {...dtoFormItemProps(ClientFormDto, 'phone')}
                >
                  <PhoneInput />
                </Form.Item>
                <div className="sm:col-span-2">
                  <Button
                    title="Создать клиента"
                    loading={creatingClient}
                    onClick={handleCreateClient}
                  >
                    Создать клиента
                  </Button>
                </div>
              </Form>
            </>
          )}

          {!isEmpty(items) && (
            <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <Text type="secondary">Итого к выдаче</Text>
              <div className="text-2xl font-semibold text-[var(--color-accent)]">
                {formatMoney(loanTotal)}
              </div>
            </div>
          )}
        </Card>
      )}

      <Space wrap>
        {currentStep > 0 && (
          <Button title="Назад" onClick={handleBack}>
            Назад
          </Button>
        )}
        {currentStep < PLEDGE_STEPS.length - 1 && (
          <Button type="primary" title="Далее" onClick={handleNext}>
            Далее
          </Button>
        )}
        {currentStep === PLEDGE_STEPS.length - 1 && (
          <Button type="primary" title="Сохранить залог" loading={saving} onClick={handleSubmit}>
            Сохранить залог
          </Button>
        )}
      </Space>
    </div>
  );
};
