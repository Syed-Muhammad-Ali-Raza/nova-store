import { useMutation } from '@tanstack/react-query';
import { createPaymentIntent } from '../api/payments';

export const useCreatePaymentIntent = (options = {}) => {
  return useMutation({
    mutationFn: createPaymentIntent,
    ...options,
  });
};