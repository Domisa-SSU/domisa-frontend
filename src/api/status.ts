import type { UserStatus } from "../types/user";

export type BackendStatusDto = {
  isRegistered: boolean;
  hasIntroduction: boolean;
  isCardCompleted: boolean;
};

export const isBackendStatusDto = (value: unknown): value is BackendStatusDto => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const status = value as Record<string, unknown>;

  return (
    typeof status.isRegistered === "boolean" &&
    typeof status.hasIntroduction === "boolean" &&
    typeof status.isCardCompleted === "boolean"
  );
};

export const normalizeUserStatus = (status: BackendStatusDto): UserStatus => ({
  isRegistered: status.isRegistered,
  hasIntroduction: status.hasIntroduction,
  isProfileCompleted: status.isCardCompleted,
});
