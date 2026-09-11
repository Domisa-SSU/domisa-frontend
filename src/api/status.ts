export type BackendStatusDto = {
  isRegistered: boolean;
  hasIntroduction: boolean;
};

export const isBackendStatusDto = (value: unknown): value is BackendStatusDto => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const status = value as Record<string, unknown>;

  return (
    typeof status.isRegistered === "boolean" &&
    typeof status.hasIntroduction === "boolean"
  );
};
