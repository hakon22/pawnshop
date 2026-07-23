import { RedeemPledgeFormDto, type RedeemPledgeFormInterface } from '@shared/dto/pledge/redeem-pledge-form.dto';

/**
 * Query preview выкупа — те же поля, что и у формы
 * (GET ?calculationDate=YYYY-MM-DD / POST body { calculationDate })
 */
export type RedeemPledgeQueryInterface = RedeemPledgeFormInterface;

export const RedeemPledgeQueryDto = RedeemPledgeFormDto;
