import { QuestionCircleOutlined } from '@ant-design/icons';
import { App, Button, Card, List, Spin, Tooltip, Typography } from 'antd';
import { isEmpty, isNil } from 'lodash-es';
import moment from 'moment-timezone';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ClientSelect, useClientSelectModel } from '@web/entities/client';
import { fetchActivePledgesFlat, fetchRedemptionPreview, redeemPledge } from '@web/entities/pledge';
import { resetRedemption, removeActivePledge, setActivePledges, setPreview, setRedemptionClient, setSelectedPledgeId } from '@web/features/redemption/model/redemption-slice';
import { formatMoney } from '@web/shared/lib/format-money';
import { getApiErrorMessage } from '@web/shared/lib/get-api-error-message';
import { EmptyPlaceholder } from '@web/shared/ui/empty-placeholder';
import { MomentDatePicker } from '@web/shared/ui/moment-date-picker';
import { PageHeader } from '@web/shared/ui/page-header';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';
import type { Moment } from 'moment';

const { Text } = Typography;
const TIME_ZONE = 'Europe/Moscow';

const todayMoscow = (): Moment => moment.tz(TIME_ZONE).startOf('day');

const PreviewRow = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) => {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border)] pb-2">
      <Text type="secondary">{label}</Text>
      <div className="flex items-center gap-1.5">
        <Text>{value}</Text>
        {Boolean(hint) && (
          <Tooltip title={hint}>
            <QuestionCircleOutlined
              className="cursor-help text-[var(--color-muted)]"
              aria-label="Формула расчёта"
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export const RedemptionFeature = () => {
  const { message, modal } = App.useApp();
  const dispatch = useAppDispatch();
  const {
    client,
    activePledges,
    selectedPledgeId,
    preview,
  } = useAppSelector(state => state.redemption);
  const clientsSelect = useClientSelectModel();

  const previewSectionRef = useRef<HTMLDivElement>(null);
  const [loadingPledges, setLoadingPledges] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [calculationDate, setCalculationDate] = useState<Moment>(() => todayMoscow());

  const selectedPledge = useMemo(
    () => activePledges.find(({ id }) => id === selectedPledgeId) ?? null,
    [activePledges, selectedPledgeId],
  );
  const selectedTariff = selectedPledge?.tariff ?? null;

  useEffect(() => {
    if (isNil(preview) && !loadingPreview) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    previewSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [preview?.pledgeId, loadingPreview]);

  const loadActivePledges = async (nextClientId: number): Promise<void> => {
    setLoadingPledges(true);
    try {
      const pledges = await fetchActivePledgesFlat({
        clientId: nextClientId,
      });
      dispatch(setActivePledges(pledges));
    } finally {
      setLoadingPledges(false);
    }
  };

  const loadPreview = async (pledgeId: number, date: Moment): Promise<void> => {
    setLoadingPreview(true);
    try {
      const nextPreview = await fetchRedemptionPreview(pledgeId, {
        calculationDate: date.format('YYYY-MM-DD'),
      });
      dispatch(setPreview(nextPreview));
    } catch (error) {
      dispatch(setPreview(null));
      message.error(getApiErrorMessage(error, 'Не удалось получить расчёт выкупа'));
      console.error(error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSelectClient = async (nextClient: ClientFindInterface): Promise<void> => {
    dispatch(setRedemptionClient(nextClient));
    dispatch(setSelectedPledgeId(null));
    dispatch(setPreview(null));
    try {
      await loadActivePledges(nextClient.id);
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось загрузить активные залоги'));
      console.error(error);
    }
  };

  const handleSelectPledge = async (pledgeId: number): Promise<void> => {
    dispatch(setSelectedPledgeId(pledgeId));
    dispatch(setPreview(null));
    await loadPreview(pledgeId, calculationDate);
  };

  const handleCalculationDateChange = async (nextDate: Moment | null): Promise<void> => {
    const date = nextDate ? moment.tz(nextDate.format('YYYY-MM-DD'), TIME_ZONE).startOf('day') : todayMoscow();
    setCalculationDate(date);
    if (!isNil(selectedPledgeId)) {
      await loadPreview(selectedPledgeId, date);
    }
  };

  const performRedeem = async (): Promise<void> => {
    if (isNil(selectedPledgeId)) {
      return;
    }
    setRedeeming(true);
    try {
      const redeemed = await redeemPledge(selectedPledgeId, {
        calculationDate: calculationDate.format('YYYY-MM-DD'),
      });
      dispatch(removeActivePledge(redeemed.id));
      dispatch(setSelectedPledgeId(null));
      dispatch(setPreview(null));
      message.success('Залог выкуплен');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось выкупить залог'));
      console.error(error);
    } finally {
      setRedeeming(false);
    }
  };

  const handleRedeem = (): void => {
    if (isNil(preview)) {
      return;
    }

    modal.confirm({
      title: `Выкупить залог №${preview.pledgeId}?`,
      content: `К оплате: ${formatMoney(preview.redemptionAmount)}`,
      centered: true,
      okText: 'Выкупить',
      cancelText: 'Отмена',
      okButtonProps: { danger: false },
      onOk: performRedeem,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6">
      <PageHeader
        title="Выкуп залога"
        description="Выберите клиента, активный залог, дату расчёта и подтвердите сумму выкупа."
      />

      <Card title="Клиент">
        <ClientSelect
          className="w-full"
          value={client}
          onChange={handleSelectClient}
          items={clientsSelect.items}
          search={clientsSelect.search}
          loading={clientsSelect.loading}
          error={clientsSelect.error}
          onSearch={clientsSelect.onSearch}
          onPopupScroll={clientsSelect.onPopupScroll}
        />
      </Card>

      {!isNil(client) && (
        <Card title="Активные залоги">
          <div className="mb-4 max-w-xs">
            <Text type="secondary" className="mb-1 block">
              Дата расчёта
            </Text>
            <MomentDatePicker
              className="w-full"
              value={calculationDate}
              onChange={handleCalculationDateChange}
              allowClear={false}
              format="DD.MM.YYYY"
            />
          </div>
          <Spin spinning={loadingPledges}>
            {isEmpty(activePledges) && !loadingPledges ? (
              <EmptyPlaceholder description="Нет активных залогов у этого клиента" />
            ) : (
              <List
                dataSource={activePledges}
                renderItem={pledge => {
                  const isSelected = selectedPledgeId === pledge.id;
                  return (
                    <List.Item
                      className={isSelected ? '!bg-[var(--color-bg)] !px-3 !rounded-lg' : undefined}
                      actions={[
                        <Button
                          key="open"
                          type={isSelected ? 'primary' : 'link'}
                          title={isSelected ? 'Выбран' : 'Открыть'}
                          loading={loadingPreview && isSelected}
                          onClick={() => handleSelectPledge(pledge.id)}
                        >
                          {isSelected ? 'Выбран' : 'Открыть'}
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={`Залог №${pledge.id} — ${formatMoney(pledge.loanAmount)}`}
                        description={`До ${moment(pledge.dueDate).format('DD.MM.YYYY')}`}
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Spin>
        </Card>
      )}

      <div ref={previewSectionRef} className="scroll-mt-24">
        {loadingPreview && isNil(preview) && (
          <Card>
            <div className="flex justify-center py-8">
              <Spin description="Расчёт выкупа…" />
            </div>
          </Card>
        )}

        {!isNil(preview) && (
          <Spin spinning={loadingPreview} description="Расчёт выкупа…">
            <Card title={`Выкуп залога №${preview.pledgeId}`} className="ui-fade-in">
              <div className="grid gap-3">
                <PreviewRow
                  label="Тариф"
                  value={selectedTariff?.name ?? '—'}
                />
                <PreviewRow
                  label="Сумма займа"
                  value={formatMoney(preview.loanAmount)}
                />
                <PreviewRow
                  label="% основного периода"
                  value={formatMoney(preview.baseInterest)}
                  hint={selectedTariff && (
                    <div>
                      <div>
                        сумма займа × ставка / 100
                      </div>
                      <div>
                        {formatMoney(preview.loanAmount)}
                        {' × '}
                        {selectedTariff.basePeriodRate}
                        {' / 100 = '}
                        {formatMoney(preview.baseInterest)}
                      </div>
                    </div>
                  )}
                />
                <PreviewRow
                  label="Дней просрочки"
                  value={preview.overdueDays}
                />
                <PreviewRow
                  label="% просрочки"
                  value={formatMoney(preview.overdueInterest)}
                  hint={selectedTariff && (
                    <div>
                      <div>
                        сумма займа × ставка просрочки / 100 × ⌈дней просрочки / дней в периоде тарифа⌉
                      </div>
                      <div>
                        {formatMoney(preview.loanAmount)}
                        {' × '}
                        {selectedTariff.overdueRate}
                        {' / 100 × ⌈'}
                        {preview.overdueDays}
                        {' / '}
                        {selectedTariff.overduePeriodDays}
                        {'⌉ = '}
                        {formatMoney(preview.overdueInterest)}
                      </div>
                      <div>
                        {`Ставка ${selectedTariff.overdueRate}% за каждые ${selectedTariff.overduePeriodDays} дн. просрочки`}
                      </div>
                    </div>
                  )}
                />
                <div className="mt-2 rounded-lg bg-[var(--color-bg)] p-4">
                  <Text type="secondary">К оплате</Text>
                  <div className="text-3xl font-semibold text-[var(--color-accent)]">
                    {formatMoney(preview.redemptionAmount)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="primary" title="Выкупить" loading={redeeming} onClick={handleRedeem}>
                  Выкупить
                </Button>
                <Button title="Сбросить" onClick={() => dispatch(resetRedemption())}>
                  Сбросить
                </Button>
              </div>
            </Card>
          </Spin>
        )}
      </div>
    </div>
  );
};
