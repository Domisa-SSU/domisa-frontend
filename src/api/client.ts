import axios from 'axios';
import { queryClient } from '../queries/queryClient';
import { reportGlobalErrorIfNeeded } from '../stores/globalErrorStore';

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

    reportGlobalErrorIfNeeded(error);

    return Promise.reject(error);
  },
);
