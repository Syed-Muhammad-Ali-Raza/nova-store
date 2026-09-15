/* eslint-disable react/prop-types */
import { useContext, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { BrandMark } from './components/AuthUI';
import CartDrawer from './components/CartDrawer';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import AdminPanel from './pages/AdminPanel';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import VerifyEmailSent from './pages/VerifyEmailSent';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TwoFactorLogin from './pages/TwoFactorLogin';
import Account from './pages/Account';

const Navbar = ({ onCartClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const linkClass =
    'rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070912]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandMark compact />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <Link to="/" className={linkClass}>
            Shop
          </Link>
          <Link to="/orders" className={linkClass}>
            Orders
          </Link>
          <Link to="/account" className={linkClass}>
            Account
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={linkClass}>
              Admin
            </Link>
          )}
          <button type="button" onClick={logout} className={linkClass}>
            Sign out
          </button>
          <button
            type="button"
            onClick={onCartClick}
            className="relative ml-2 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10"
            aria-label={`Open cart with ${totalItems} items`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-9H5.4L7 13Zm0 0-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onCartClick}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white"
            aria-label={`Open cart with ${totalItems} items`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-9H5.4L7 13Zm0 0-2 2h12"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-500 px-1 text-[10px]">
                {totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={menuOpen ? 'M6 18 18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-white/10 px-4 py-4 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className={linkClass}>
              Shop
            </Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)} className={linkClass}>
              Orders
            </Link>
            <Link to="/account" onClick={() => setMenuOpen(false)} className={linkClass}>
              Account
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className={linkClass}>
                Admin
              </Link>
            )}
            <button type="button" onClick={logout} className={`${linkClass} text-left`}>
              Sign out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

const Home = () => (
  <>
    <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-violet-500/10 px-6 py-10 sm:px-10 sm:py-14">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">
          Curated for everyday excellence
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
          Find your next favorite.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
          Premium technology, furniture, audio, and accessories chosen to make every day feel considered.
        </p>
      </div>
    </section>
    <Products />
  </>
);

const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);
  const [cartOpen, setCartOpen] = useState(false);
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#070912] text-white">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
};

const AdminRoute = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminPanel />;
};

function App() {
  const { loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070912]" role="status" aria-label="Loading account">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />
      </div>
    );
  }

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/two-factor" element={<TwoFactorLogin />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Home />} />
            <Route path="orders" element={<Orders />} />
            <Route path="account" element={<Account />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
