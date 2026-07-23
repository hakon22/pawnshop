import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ClientFindInterface } from '@shared/dto/client/client-find.dto';
import type { PledgeFindInterface } from '@shared/dto/pledge/pledge-find.dto';
import type { RedemptionPreviewInterface } from '@shared/dto/pledge/redemption-preview.dto';

interface RedemptionStateInterface {
  client: ClientFindInterface | null;
  selectedPledgeId: number | null;
  activePledges: PledgeFindInterface[];
  preview: RedemptionPreviewInterface | null;
}

const initialState: RedemptionStateInterface = {
  client: null,
  selectedPledgeId: null,
  activePledges: [],
  preview: null,
};

const redemptionSlice = createSlice({
  name: 'redemption',
  initialState,
  reducers: {
    setRedemptionClient: (state, action: PayloadAction<ClientFindInterface | null>) => {
      state.client = action.payload;
    },
    setActivePledges: (state, action: PayloadAction<PledgeFindInterface[]>) => {
      state.activePledges = action.payload;
    },
    removeActivePledge: (state, action: PayloadAction<number>) => {
      state.activePledges = state.activePledges.filter(({ id }) => id !== action.payload);
    },
    setSelectedPledgeId: (state, action: PayloadAction<number | null>) => {
      state.selectedPledgeId = action.payload;
    },
    setPreview: (state, action: PayloadAction<RedemptionPreviewInterface | null>) => {
      state.preview = action.payload;
    },
    resetRedemption: () => initialState,
  },
});

export const {
  setRedemptionClient,
  setActivePledges,
  removeActivePledge,
  setSelectedPledgeId,
  setPreview,
  resetRedemption,
} = redemptionSlice.actions;

export const redemptionReducer = redemptionSlice.reducer;
