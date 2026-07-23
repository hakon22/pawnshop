import { configureStore } from '@reduxjs/toolkit';

import { catalogReducer } from '@web/entities/catalog/model/catalog-slice';
import { pledgeFormReducer } from '@web/features/pledge-form/model/pledge-form-slice';
import { redemptionReducer } from '@web/features/redemption/model/redemption-slice';

export const makeStore = () => configureStore({
  reducer: {
    catalog: catalogReducer,
    pledgeForm: pledgeFormReducer,
    redemption: redemptionReducer,
  },
});

export type AppStoreInterface = ReturnType<typeof makeStore>;
export type RootStateInterface = ReturnType<AppStoreInterface['getState']>;
export type AppDispatchInterface = AppStoreInterface['dispatch'];
