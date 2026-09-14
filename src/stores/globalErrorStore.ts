import { useSyncExternalStore } from "react";
import { isAxiosError } from "axios";

import { shouldShowGlobalError } from "../utils/apiError";

type GlobalErrorDebugInfo = {
  name: string;
  message: string;
  code?: string;
  status?: number;
  method?: string;
  url?: string;
};

let hasGlobalError = false;
let globalErrorDebugInfo: GlobalErrorDebugInfo | null = null;
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

export const getErrorDebugInfo = (error: unknown): GlobalErrorDebugInfo => {
  if (isAxiosError(error)) {
    return {
      name: error.name,
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.response?.status ? { status: error.response.status } : {}),
      ...(error.config?.method
        ? { method: error.config.method.toUpperCase() }
        : {}),
      ...(error.config?.url ? { url: error.config.url } : {}),
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
};

export const useHasGlobalError = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const getGlobalErrorDebugInfo = () => globalErrorDebugInfo;

export const reportGlobalError = (error?: unknown) => {
  if (hasGlobalError) {
    return;
  }

  hasGlobalError = true;
  globalErrorDebugInfo = error === undefined ? null : getErrorDebugInfo(error);
  emitChange();
};

export const reportGlobalErrorIfNeeded = (error: unknown) => {
  if (!shouldShowGlobalError(error)) {
    return false;
  }

  reportGlobalError(error);
  return true;
};

export const clearGlobalError = () => {
  if (!hasGlobalError) {
    return;
  }

  hasGlobalError = false;
  globalErrorDebugInfo = null;
  emitChange();
};
