import { useSyncExternalStore } from "react";

import { shouldShowGlobalError } from "../utils/apiError";

let hasGlobalError = false;
const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => hasGlobalError;

export const useHasGlobalError = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const reportGlobalError = () => {
  if (hasGlobalError) {
    return;
  }

  hasGlobalError = true;
  emitChange();
};

export const reportGlobalErrorIfNeeded = (error: unknown) => {
  if (!shouldShowGlobalError(error)) {
    return false;
  }

  reportGlobalError();
  return true;
};

export const clearGlobalError = () => {
  if (!hasGlobalError) {
    return;
  }

  hasGlobalError = false;
  emitChange();
};
