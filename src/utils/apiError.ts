import axios from "axios";

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
