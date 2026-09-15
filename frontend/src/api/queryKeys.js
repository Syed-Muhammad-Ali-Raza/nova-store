export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'],
  },
  products: {
    all: () => ['products'],
    list: (params = {}) => ['products', 'list', params],
    admin: (params = {}) => ['products', 'admin', params],
  },
  orders: {
    all: () => ['orders'],
    mine: (params = {}) => ['orders', 'mine', params],
    admin: (params = {}) => ['orders', 'admin', params],
  },
  logs: {
    list: (params = {}) => ['logs', 'list', params],
  },
};