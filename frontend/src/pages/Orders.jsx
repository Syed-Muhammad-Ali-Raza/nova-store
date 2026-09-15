import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyOrders } from '../hooks/useOrders';

const statusColor = (status) => {
  switch (status) {
    case 'cod':
      return 'bg-green-500/20 text-green-400';
    case 'paid':
      return 'bg-blue-500/20 text-blue-400';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'shipped':
      return 'bg-purple-500/20 text-purple-400';
    case 'delivered':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const paymentLabel = (method) => {
  switch (method) {
    case 'stripe':
      return '💳 Card';
    case 'cod':
      return '📦 COD';
    default:
      return method || '—';
  }
};

const Orders = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyOrders({ page, limit: 10 });

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
        <p className="text-gray-400">Track and review your purchase history.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-400 mb-4">You haven&apos;t placed any orders yet.</p>
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors inline-block"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-700">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">Order #{order.id}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  {order.trackingNumber && (
                    <p className="text-gray-500 text-xs mt-1">Tracking: {order.trackingNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-gray-400 text-xs">{paymentLabel(order.paymentMethod)}</p>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=50&q=80'}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-indigo-400 text-sm font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                ← Prev
              </button>
              <span className="text-gray-400 text-sm">
                {total} orders · Page {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
