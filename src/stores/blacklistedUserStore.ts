import { useSyncExternalStore } from "react";

let isBlacklistedUser = false;
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

const getSnapshot = () => isBlacklistedUser;

export const useIsBlacklistedUser = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const reportBlacklistedUser = () => {
  if (isBlacklistedUser) {
    return;
  }

  isBlacklistedUser = true;
  emitChange();
};
