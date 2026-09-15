import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { logEvent } from '../utils/logger';
import { useCart } from '../context/CartContext';
import { usePlaceOrder } from '../hooks/useOrders';
import { useCreatePaymentIntent } from '../hooks/usePayments';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ total, cartItems, createPaymentIntent, placeOrder, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const { clientSecret, paymentIntentId } = await createPaymentIntent({ amount: total });
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }
      await placeOrder({ cartItems, paymentMethod: 'stripe', paymentIntentId });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Card Details</h2>
      <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
        <CardElement
          options={{
            style: {
              base: { fontSize: '16px', color: '#fff', '::placeholder': { color: '#6b7280' } },
              invalid: { color: '#ff6b6b' },
            },
          }}
        />
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
      <button type="submit" disabled={loading || !stripe} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-lg">
        {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const placeOrderMutation = usePlaceOrder();
  const createIntentMutation = useCreatePaymentIntent();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCOD = async () => {
    try {
      setError('');
      const res = await placeOrderMutation.mutateAsync({ cartItems, paymentMethod: 'cod' });
      clearCart();
      setSuccess(true);
      setOrderId(res.id);
      logEvent('CHECKOUT', { orderId: res.id, totalItems: cartItems.length });
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-4">Order ID: {orderId}</p>
          <p className="text-gray-400 mb-6">Thank you for your purchase.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {cartItems.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <p className="text-gray-400 mb-4">Your cart is empty.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">Shop Now</button>
          </div>
        )}

        {cartItems.length > 0 && (
          <>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=50&q=80'} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div><p className="text-white text-sm font-medium">{item.name}</p><p className="text-gray-400 text-xs">Qty: {item.quantity}</p></div>
                  </div>
                  <span className="text-indigo-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold text-xl">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label><input name="fullName" className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">Phone</label><input name="phone" className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-400 mb-1">Address</label><input name="address" className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">City</label><input name="city" className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-gray-400 mb-1">ZIP Code</label><input name="zipCode" className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'stripe' ? 'bg-indigo-600/20 border border-indigo-500/50' : 'bg-gray-900 border border-gray-700 hover:border-indigo-500'}`}>
                  <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-indigo-600" />
                  <span className="text-white">💳 Credit / Debit Card</span>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'bg-indigo-600/20 border border-indigo-500/50' : 'bg-gray-900 border border-gray-700 hover:border-indigo-500'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-indigo-600" />
                  <span className="text-white">📦 Cash on Delivery</span>
                </label>
              </div>
            </div>

            {paymentMethod === 'stripe' ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  total={total}
                  cartItems={cartItems}
                  createPaymentIntent={(payload) => createIntentMutation.mutateAsync(payload)}
                  placeOrder={(payload) => placeOrderMutation.mutateAsync(payload)}
                  onSuccess={() => { setSuccess(true); clearCart(); }}
                />
              </Elements>
            ) : (
              <button onClick={handleCOD} disabled={placeOrderMutation.isPending} className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-lg">
                {placeOrderMutation.isPending ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
              </button>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;