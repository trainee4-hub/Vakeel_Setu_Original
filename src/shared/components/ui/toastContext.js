import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

const NOOP = { success: () => {}, error: () => {}, info: () => {} };

export function useCCToast() {
  return useContext(ToastContext) ?? NOOP;
}
