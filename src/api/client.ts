import axios from 'axios';
import { queryClient } from '../queries/queryClient';
import { reportGlobalErrorIfNeeded } from '../stores/globalErrorStore';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 실패해도 전역 에러 화면까지는 띄우지 않는다.
     *
     * react-query 의 meta.suppressGlobalError 와 짝이다. 아래 인터셉터는 meta 를 알 수 없고
     * mutationCache 보다 먼저 돌기 때문에, 여기서 표시해두지 않으면 화면 한 켠에서 조용히
     * 실패해야 할 요청이 앱 전체를 에러 페이지로 덮어버린다.
     */
    skipGlobalError?: boolean;
  }
}

const authMeQueryKey = ['auth', 'me'] as const;

/**
 * 백엔드 API 호출에 사용하는 공통 axios client.
 * VITE_API_BASE_URL을 baseURL로 사용하고, httpOnly 쿠키 인증을 위해 withCredentials를 켠다.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      queryClient.setQueryData(authMeQueryKey, null);
    }

    if (!error.config?.skipGlobalError) {
      reportGlobalErrorIfNeeded(error);
    }

    return Promise.reject(error);
  },
);
