import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAdminLogs,
  fetchAdminOrders,
  updateOrderStatus,
} from '../api/admin';
import { queryKeys } from '../api/queryKeys';

export const useAdminProducts = ({ page = 1, limit = 12 } = {}, options = {}) => {
  const params = { page, limit };

  return useQuery({
    queryKey: queryKeys.products.admin(params),
    queryFn: () => fetchAdminProducts(params),
    placeholderData: (previousData) => previousData ?? undefined,
    ...options,
  });
};

export const useAdminLogs = ({ page = 1, limit = 20 } = {}, options = {}) => {
  const params = { page, limit };

  return useQuery({
    queryKey: queryKeys.logs.list(params),
    queryFn: () => fetchAdminLogs(params),
    ...options,
  });
};

export const useAdminOrders = ({ page = 1, limit = 10, status = 'all', search = '' } = {}, options = {}) => {
  const params = {
    page,
    limit,
    ...(status && status !== 'all' && { status }),
    ...(search && { search }),
  };

  return useQuery({
    queryKey: queryKeys.orders.admin(params),
    queryFn: () => fetchAdminOrders(params),
    placeholderData: (previousData) => previousData ?? undefined,
    ...options,
  });
};

const makeInvalidationMutation = (mutationFn, invalidateKeys) => (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
};

export const useProductCreate = makeInvalidationMutation(createProduct, [queryKeys.products.all()]);
export const useProductUpdate = makeInvalidationMutation(updateProduct, [queryKeys.products.all()]);
export const useProductDelete = makeInvalidationMutation(deleteProduct, [queryKeys.products.all()]);
export const useOrderUpdate = makeInvalidationMutation(updateOrderStatus, [queryKeys.orders.all()]);