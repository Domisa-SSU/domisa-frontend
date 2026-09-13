import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { reportGlobalErrorIfNeeded } from "../stores/globalErrorStore";
import { shouldShowGlobalError } from "../utils/apiError";

const logDevelopmentGlobalError = (
  source: "query" | "mutation",
  key: readonly unknown[] | undefined,
  error: unknown,
) => {
  if (!import.meta.env.DEV || !shouldShowGlobalError(error)) {
    return;
  }

  console.error(`[Domisa ${source} error]`, {
    key,
    error,
  });
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      logDevelopmentGlobalError("query", query.queryKey, error);
      reportGlobalErrorIfNeeded(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      logDevelopmentGlobalError("mutation", mutation.options.mutationKey, error);

      if (mutation.options.meta?.suppressGlobalError === true) {
        return;
      }

      reportGlobalErrorIfNeeded(error);
    },
  }),
});
