import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyOrders, placeOrder } from '../api/orders';
import { queryKeys } from '../api/queryKeys';

export const useMyOrders = ({ page = 1, limit = 10 } = {}, options = {}) => {
  const params = { page, limit };

  return useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => fetchMyOrders(params),
    placeholderData: (previousData) => previousData ?? undefined,
    ...options,
  });
};

export const usePlaceOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
};