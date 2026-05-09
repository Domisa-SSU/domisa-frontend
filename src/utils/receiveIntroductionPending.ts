import { RECEIVE_INTRODUCTION_PENDING_STORAGE_KEY } from "../constants/storageKeys";

export type ReceiveIntroductionPending = {
  linkCode: string;
  introductionId: number;
};

const isReceiveIntroductionPending = (
  value: unknown,
): value is ReceiveIntroductionPending => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const pending = value as Record<string, unknown>;

  return (
    typeof pending.linkCode === "string" &&
    typeof pending.introductionId === "number"
  );
};

export const getReceiveIntroductionPending = () => {
  const savedPending = sessionStorage.getItem(
    RECEIVE_INTRODUCTION_PENDING_STORAGE_KEY,
  );

  if (!savedPending) {
    return null;
  }

  try {
    const pending = JSON.parse(savedPending);

    return isReceiveIntroductionPending(pending) ? pending : null;
  } catch {
    return null;
  }
};

export const setReceiveIntroductionPending = (
  pending: ReceiveIntroductionPending,
) => {
  sessionStorage.setItem(
    RECEIVE_INTRODUCTION_PENDING_STORAGE_KEY,
    JSON.stringify(pending),
  );
};

export const clearReceiveIntroductionPending = () => {
  sessionStorage.removeItem(RECEIVE_INTRODUCTION_PENDING_STORAGE_KEY);
};
