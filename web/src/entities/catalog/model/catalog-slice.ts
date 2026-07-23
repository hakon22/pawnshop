import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { fetchItemCategoriesFlat } from '@web/entities/catalog/api/item-category-api';
import { fetchTariffsFlat } from '@web/entities/catalog/api/tariff-api';

import type { ItemCategoryFindInterface } from '@shared/dto/catalog/item-category-find.dto';
import type { TariffFindInterface } from '@shared/dto/catalog/tariff-find.dto';

type LoadStatusType = 'idle' | 'loading' | 'loaded' | 'error';

interface CatalogStateInterface {
  tariffs: TariffFindInterface[];
  tariffsStatus: LoadStatusType;
  categories: ItemCategoryFindInterface[];
  categoriesStatus: LoadStatusType;
}

const initialState: CatalogStateInterface = {
  tariffs: [],
  tariffsStatus: 'idle',
  categories: [],
  categoriesStatus: 'idle',
};

export const ensureTariffsLoaded = createAsyncThunk(
  'catalog/ensureTariffsLoaded',
  async () => fetchTariffsFlat(),
);

export const ensureCategoriesLoaded = createAsyncThunk(
  'catalog/ensureCategoriesLoaded',
  async () => fetchItemCategoriesFlat(),
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(ensureTariffsLoaded.pending, state => {
        state.tariffsStatus = 'loading';
      })
      .addCase(ensureTariffsLoaded.fulfilled, (state, action: PayloadAction<TariffFindInterface[]>) => {
        state.tariffs = action.payload;
        state.tariffsStatus = 'loaded';
      })
      .addCase(ensureTariffsLoaded.rejected, state => {
        state.tariffsStatus = 'error';
      })
      .addCase(ensureCategoriesLoaded.pending, state => {
        state.categoriesStatus = 'loading';
      })
      .addCase(ensureCategoriesLoaded.fulfilled, (state, action: PayloadAction<ItemCategoryFindInterface[]>) => {
        state.categories = action.payload;
        state.categoriesStatus = 'loaded';
      })
      .addCase(ensureCategoriesLoaded.rejected, state => {
        state.categoriesStatus = 'error';
      });
  },
});

export const catalogReducer = catalogSlice.reducer;
