import { useMutation } from '@tanstack/react-query';
import { cancelCookieOrder, createCookieOrder } from '../api/orders';

export const useCreateCookieOrderMutation = () =>
  useMutation({
    mutationFn: createCookieOrder,
  });

export const useCancelCookieOrderMutation = () =>
  useMutation({
    mutationFn: cancelCookieOrder,
  });