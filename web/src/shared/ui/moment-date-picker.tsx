import momentGenerateConfig from '@rc-component/picker/lib/generate/moment';
import { DatePicker } from 'antd';

import type { Moment } from 'moment';

/**
 * Ant Design DatePicker на moment (как в am-chokers), вместо дефолтного dayjs
 */
export const MomentDatePicker = DatePicker.generatePicker<Moment>(momentGenerateConfig);
