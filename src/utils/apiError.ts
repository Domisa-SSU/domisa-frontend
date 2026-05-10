import axios from "axios";

type ApiRequestErrorOptions = {
  status?: number;
  isNetworkError?: boolean;
};

export class ApiRequestError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;

  constructor(message: string, options: ApiRequestErrorOptions = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options.status;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

export const isInsufficientCookiesError = (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 402) {
    return false;
  }

  const responseData = error.response.data;

  if (!responseData || typeof responseData !== "object") {
    return false;
  }

  return (
    (responseData as Record<string, unknown>).code === "INSUFFICIENT_COOKIES"
  );
};

export const isServerError = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    const status = error.status ?? 0;

    return status >= 500 && status < 600;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status ?? 0;

  return status >= 500 && status < 600;
};

export const isNetworkError = (error: unknown) => {
  if (error instanceof ApiRequestError) {
    return error.isNetworkError;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (error.code === "ERR_CANCELED") {
    return false;
  }

  return !error.response;
};

export const isApiContractError = (error: unknown) =>
  error instanceof Error && /^Invalid .+ response$/.test(error.message);

export const shouldShowGlobalError = (error: unknown) =>
  isServerError(error) || isNetworkError(error) || isApiContractError(error);
