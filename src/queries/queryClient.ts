import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { reportGlobalErrorIfNeeded } from "../stores/globalErrorStore";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: reportGlobalErrorIfNeeded,
  }),
  mutationCache: new MutationCache({
    onError: reportGlobalErrorIfNeeded,
  }),
});
