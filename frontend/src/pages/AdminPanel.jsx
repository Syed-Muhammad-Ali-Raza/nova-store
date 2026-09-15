import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { logEvent } from '../utils/logger';
import { API_URL } from '../utils/api';

const AdminPanel = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [logTotal, setLogTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/products?page=${productPage}&limit=12`);
      const data = res.data;
      setProducts(data.products);
      setProductTotal(data.total);
      setProductTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/logs?page=${logPage}&limit=20`);
      const data = res.data;
      setLogs(data.logs);
      setLogTotal(data.total);
      setLogTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch logs');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders?page=${orderPage}&limit=10&status=${orderStatusFilter}&search=${orderSearch}`);
      const data = res.data;
      setOrders(data.orders);
      setOrderTotal(data.total);
      setOrderTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${id}`, { status });
      logEvent('UPDATE_ORDER', { orderId: id, status });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const handleTrackingUpdate = async (id, trackingNumber) => {
    try {
      await axios.put(`${API_URL}/api/admin/orders/${id}`, { trackingNumber });
      logEvent('UPDATE_TRACKING', { orderId: id, trackingNumber });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update tracking number');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setOrderPage(1);
    fetchOrders();
  };

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'logs') fetchLogs();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, productPage, logPage, orderPage, orderStatusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/products`, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      });
      setShowModal(false);
      setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      fetchProducts();
      logEvent('ADD_PRODUCT', { productName: formData.name });
    } catch (err) {
      console.error('Failed to create product');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/admin/products/${editingProduct.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      });
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      fetchProducts();
      logEvent('UPDATE_PRODUCT', { productId: editingProduct.id });
    } catch (err) {
      console.error('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/products/${id}`);
      fetchProducts();
      logEvent('DELETE_PRODUCT', { productId: id });
    } catch (err) {
      console.error('Failed to delete product');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, description: product.description || '', price: product.price, stock: product.stock, category: product.category, imageUrl: product.imageUrl || '' });
    setShowModal(true);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage products and view activity logs</p>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-300 hover:text-red-400 text-sm transition-colors border border-gray-700"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Orders
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">All Products ({productTotal})</h2>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Add Product
            </button>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Deleted</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-white text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{product.category}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{product.stock}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.deletedAt ? (
                        <span className="text-red-400">Yes</span>
                      ) : (
                        <span className="text-green-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm flex gap-2 justify-end">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 mb-6">
              <button
                onClick={() => setProductPage(p => Math.max(1, p - 1))}
                disabled={productPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                ← Prev
              </button>
              <span className="text-gray-400 text-sm mr-2">{productTotal} products</span>
              <button
                onClick={() => setProductPage(p => Math.min(productTotalPages, p + 1))}
                disabled={productPage === productTotalPages}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Activity Logs</h2>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Metadata</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-gray-300 text-sm">{log.user?.email || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        log.action === 'LOGIN' ? 'bg-green-500/20 text-green-400' :
                        log.action === 'LOGOUT' ? 'bg-gray-500/20 text-gray-400' :
                        log.action === 'CHECKOUT' ? 'bg-blue-500/20 text-blue-400' :
                        log.action.includes('PRODUCT') ? 'bg-purple-500/20 text-purple-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono max-w-xs truncate">
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 mb-6">
              <button
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                ← Prev
              </button>
              <span className="text-gray-400 text-sm mr-2">{logTotal} logs</span>
              <button
                onClick={() => setLogPage(p => Math.min(logTotalPages, p + 1))}
                disabled={logPage === logTotalPages}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">All Orders ({orderTotal})</h2>
            <div className="flex items-center gap-3">
              <select
                value={orderStatusFilter}
                onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cod">COD</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search ID or tracking…"
                  className="w-56 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button type="submit" className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Search</button>
              </form>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Tracking</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-750 transition-colors align-top">
                    <td className="px-6 py-4 text-white text-sm font-medium">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{order.user?.email || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-400 text-xs space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between gap-3">
                            <span className="truncate max-w-[140px]">{item.name}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && <span className="text-gray-500">+{order.items.length - 3} more…</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-bold">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-xs block">{order.paymentMethod || '—'}</span>
                      <span className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-400' : order.paymentStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {order.paymentStatus || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        defaultValue={order.trackingNumber || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (order.trackingNumber || '')) handleTrackingUpdate(order.id, e.target.value);
                        }}
                        placeholder="Add tracking…"
                        className="w-36 px-2 py-1 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-gray-900 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cod">COD</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orderTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 mb-6">
              <button
                onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                disabled={orderPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                ← Prev
              </button>
              <span className="text-gray-400 text-sm mr-2">{orderTotal} orders · Page {orderPage}/{orderTotalPages}</span>
              <button
                onClick={() => setOrderPage(p => Math.min(orderTotalPages, p + 1))}
                disabled={orderPage === orderTotalPages}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-40 transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProduct ? 'Edit Product' : 'Create Product'}
            </h2>
            <form onSubmit={editingProduct ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
                  <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                <input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;