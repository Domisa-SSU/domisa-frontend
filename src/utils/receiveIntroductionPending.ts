import { RECEIVE_INTRODUCTION_PENDING_STORAGE_KEY } from "../constants/storageKeys";

export type ReceiveIntroductionPending = {
  linkCode: string;
  introductionId: number;
  shouldShowSignupCompleteModal: boolean;
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
    typeof pending.introductionId === "number" &&
    typeof pending.shouldShowSignupCompleteModal === "boolean"
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

export const markReceiveIntroductionPendingAfterSignup = (linkCode: string) => {
  const pending = getReceiveIntroductionPending();

  if (!pending || pending.linkCode !== linkCode) {
    return;
  }

  setReceiveIntroductionPending({
    ...pending,
    shouldShowSignupCompleteModal: true,
  });
};
