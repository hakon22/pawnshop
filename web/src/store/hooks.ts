import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { AppDispatchInterface, RootStateInterface } from '@web/store/index';

export const useAppDispatch = () => useDispatch<AppDispatchInterface>();
export const useAppSelector: TypedUseSelectorHook<RootStateInterface> = useSelector;
