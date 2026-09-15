import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const inCart = cartItems.find((item) => item.id === product.id);

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 group flex flex-col">
      <div className="relative overflow-hidden h-52">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock <= 5 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Only {product.stock} left!
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-white text-lg leading-snug">{product.name}</h3>
        <p className="text-gray-400 text-sm mt-2 flex-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <span className="text-2xl font-bold text-indigo-400">${product.price.toFixed(2)}</span>
          <button
            onClick={() => addToCart(product)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm ${
              inCart
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {inCart ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                In Cart ({inCart.quantity})
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-9H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load products. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-2xl h-80 animate-pulse border border-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 bg-red-500/10 border border-red-500/50 rounded-xl p-4">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductsPage;
