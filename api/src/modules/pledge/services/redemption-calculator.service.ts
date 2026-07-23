import { Injectable } from '@nestjs/common';
import moment from 'moment-timezone';

import { BaseService } from '@infrastructure/base/base.service';

import { roundMoney } from '@shared/lib/round-money';

import type { RedemptionPreviewInterface } from '@shared/dto/pledge/redemption-preview.dto';

/** Входные данные расчёта выкупа */
interface CalculateRedemptionInputInterface {
  /** Идентификатор залога */
  pledgeId: number;
  /** Сумма займа */
  loanAmount: number;
  /** Дата окончания базового срока */
  dueDate: Date;
  /** Процент за базовый период */
  basePeriodRate: number;
  /** Длина одного периода просрочки в календарных днях */
  overduePeriodDays: number;
  /** Процент просрочки за один период {@link overduePeriodDays} */
  overdueRate: number;
  /** Дата расчёта (по умолчанию — сейчас); Date или `YYYY-MM-DD` / ISO */
  calculationDate?: Date | string;
}

/**
 * Расчёт суммы выкупа по тарифу.
 *
 * Формула:
 * - в срок (calculationDate <= dueDate, включая день «до»):
 *   interest = loanAmount * basePeriodRate / 100
 * - просрочка (calculationDate > dueDate):
 *   overdueDays = calendar days after dueDate (Europe/Moscow, startOf day)
 *   overduePeriods = ceil(overdueDays / overduePeriodDays)
 *   interest = loanAmount * basePeriodRate / 100
 *            + loanAmount * overdueRate / 100 * overduePeriods
 *
 * overdueRate — % за один период длиной overduePeriodDays календарных дней.
 */
@Injectable()
export class RedemptionCalculatorService extends BaseService {
  private readonly TAG = 'RedemptionCalculatorService';

  private readonly timeZone = 'Europe/Moscow';

  /**
   * Считает проценты и итоговую сумму выкупа
   * @param input - параметры займа и тарифа ({@link CalculateRedemptionInputInterface})
   * @returns превью расчёта выкупа ({@link RedemptionPreviewInterface})
   */
  public calculate = (input: CalculateRedemptionInputInterface): RedemptionPreviewInterface => {
    const calculationMoment = moment(input.calculationDate ?? new Date()).tz(this.timeZone).startOf('day');
    const dueMoment = moment(input.dueDate).tz(this.timeZone).startOf('day');
    const loanAmount = Number(input.loanAmount);
    const basePeriodRate = Number(input.basePeriodRate);
    const overdueRate = Number(input.overdueRate);
    const overduePeriodDays = Math.max(1, Number(input.overduePeriodDays) || 1);

    const baseInterest = loanAmount * basePeriodRate / 100;
    const overdueDays = Math.max(0, calculationMoment.diff(dueMoment, 'days'));
    const isOverdue = overdueDays > 0;
    const overduePeriods = isOverdue
      ? Math.ceil(overdueDays / overduePeriodDays)
      : 0;
    const overdueInterest = isOverdue
      ? loanAmount * overdueRate / 100 * overduePeriods
      : 0;
    const interest = baseInterest + overdueInterest;
    const redemptionAmount = loanAmount + interest;

    const result: RedemptionPreviewInterface = {
      pledgeId: input.pledgeId,
      loanAmount,
      baseInterest: roundMoney(baseInterest),
      overdueDays,
      overdueInterest: roundMoney(overdueInterest),
      interest: roundMoney(interest),
      redemptionAmount: roundMoney(redemptionAmount),
      dueDate: dueMoment.toISOString(),
      calculatedAt: calculationMoment.toISOString(),
      isOverdue,
    };

    this.loggerService.debug(this.TAG, 'calculate', result);
    return result;
  };
}
