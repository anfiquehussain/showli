import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';

/**
 * Pre-typed Redux hooks.
 * Use these instead of plain `useDispatch` and `useSelector` throughout the app.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
