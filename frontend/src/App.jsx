import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import AdminPanel from './pages/AdminPanel';
import CartDrawer from './components/CartDrawer';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

const Navbar = ({ onCartClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useCart();

  return (
    <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">NovStore</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/orders"
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium transition-colors border border-gray-700"
          >
            My Orders
          </Link>

          {user && (
            <span className="text-gray-400 text-sm hidden sm:block">
              {user.email}
            </span>
          )}

          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-sm font-medium transition-colors border border-indigo-500/30"
            >
              Admin Panel
            </Link>
          )}

          {/* Cart Button */}
          <button
            id="cart-btn"
            onClick={onCartClick}
            className="relative p-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {totalItems}
              </span>
            )}
          </button>

          {user && (
            <button
              id="logout-btn"
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors border border-gray-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const Home = () => {
  return (
    <>
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-gray-900 border border-indigo-800/40 p-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to <span className="text-indigo-400">NovStore</span>
        </h1>
        <p className="text-gray-400 text-lg">Discover premium products curated just for you.</p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Featured Products</h2>
      <Products />
    </>
  );
};

const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);
  const [cartOpen, setCartOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;