import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';
import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';
import type { PledgeItemFormInterface } from '@shared/dto/pledge/pledge-item-form.dto';

interface PledgeFormStateInterface {
  tariff: TariffFindInterface | null;
  client: ClientFindInterface | null;
  items: PledgeItemFormInterface[];
}

const initialState: PledgeFormStateInterface = {
  tariff: null,
  client: null,
  items: [],
};

const pledgeFormSlice = createSlice({
  name: 'pledgeForm',
  initialState,
  reducers: {
    setTariff: (state, action: PayloadAction<TariffFindInterface | null>) => {
      state.tariff = action.payload;
    },
    setClient: (state, action: PayloadAction<ClientFindInterface | null>) => {
      state.client = action.payload;
    },
    setItems: (state, action: PayloadAction<PledgeItemFormInterface[]>) => {
      state.items = action.payload;
    },
    resetPledgeForm: () => initialState,
  },
});

export const {
  setTariff,
  setClient,
  setItems,
  resetPledgeForm,
} = pledgeFormSlice.actions;

export const pledgeFormReducer = pledgeFormSlice.reducer;
