import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import { queryKeys } from '../api/queryKeys';

export const useProducts = ({ search, category, minPrice, maxPrice, inStock, sortBy, page = 1, limit = 12 } = {}, options = {}) => {
  const params = {
    ...(search && { search }),
    ...(category && { category }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(inStock && { inStock }),
    ...(sortBy && sortBy !== 'newest' && { sortBy }),
    page,
    limit,
  };

  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: (previousData) => previousData ?? undefined,
    ...options,
  });
};