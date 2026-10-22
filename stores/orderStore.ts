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
      return {
        lines: {
          ...state.lines,
          [drug.id]: existing
            ? { ...existing, quantity: existing.quantity + quantity }
            : { drug, quantity },
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
      if (!line) return state;
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

// ---------- Хуки с shallow-сравнением ----------
export const useOrderLines = () =>
  useOrderStore(useShallow(selectOrderLines));