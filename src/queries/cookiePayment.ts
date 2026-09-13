import { useMutation } from '@tanstack/react-query';
import { confirmCookiePayment } from '../api/cookiePayment';

export const useConfirmCookiePaymentMutation = () =>
  useMutation({
    mutationFn: confirmCookiePayment,
  });
