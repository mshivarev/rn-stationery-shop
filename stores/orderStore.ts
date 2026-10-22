import { create } from 'zustand';
import { Drug, OrderLine } from '../types/drug';
import { useShallow } from 'zustand/react/shallow';

interface OrderState {
  lines: Record<string, OrderLine>;

  add: (drug: Drug, quantity?: number) => void;
  remove: (drugId: string) => void;
  increment: (drugId: string) => void;
  decrement: (drugId: string) => void;
  clear: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  lines: {},

  add: (drug, quantity = 1) =>
    set((state) => {
      const existing = state.lines[drug.id];
      const next = Math.min((existing?.quantity ?? 0) + quantity, drug.stock);
      if (next <= 0) return state;
      return {
        lines: {
          ...state.lines,
          [drug.id]: { drug, quantity: next },
        },
      };
    }),

  remove: (drugId) =>
    set((state) => {
      const { [drugId]: _removed, ...rest } = state.lines;
      return { lines: rest };
    }),

  increment: (drugId) =>
    set((state) => {
      const line = state.lines[drugId];
      if (!line || line.quantity >= line.drug.stock) return state;
      return {
        lines: {
          ...state.lines,
          [drugId]: { ...line, quantity: line.quantity + 1 },
        },
      };
    }),

  decrement: (drugId) =>
    set((state) => {
      const line = state.lines[drugId];
      if (!line) return state;
      // Если количество станет 0 — просто удаляем позицию
      if (line.quantity <= 1) {
        const { [drugId]: _removed, ...rest } = state.lines;
        return { lines: rest };
      }
      return {
        lines: {
          ...state.lines,
          [drugId]: { ...line, quantity: line.quantity - 1 },
        },
      };
    }),

  clear: () => set({ lines: {} }),
}));

// ---------- Селекторы ----------
export const selectOrderCount = (s: OrderState): number =>
  Object.values(s.lines).reduce((sum, line) => sum + line.quantity, 0);

export const selectOrderLines = (s: OrderState): OrderLine[] =>
  Object.values(s.lines);

export const selectQuantity =
  (drugId: string) =>
  (s: OrderState): number =>
    s.lines[drugId]?.quantity ?? 0;

// ---------- Хуки с shallow-сравнением ----------
export const useOrderLines = () =>
  useOrderStore(useShallow(selectOrderLines));