/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import FilterSidebar from '../components/FilterSidebar';
import { useProducts } from '../hooks/useProducts';

const fallbackImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=85';
const defaultFilters = { search: '', category: '', minPrice: '', maxPrice: '', inStock: '', sortBy: 'newest' };

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useCart();
  const inCart = cartItems.find((item) => item.id === product.id);
  const outOfStock = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.055] hover:shadow-2xl hover:shadow-indigo-950/30">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070912]/75 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {product.category || 'General'}
        </span>
        {product.stock <= 5 && (
          <span
            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${
              outOfStock ? 'bg-rose-500/90 text-white' : 'bg-amber-300/90 text-slate-950'
            }`}
          >
            {outOfStock ? 'Sold out' : `${product.stock} left`}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold leading-snug text-white">{product.name}</h3>
          <span className="shrink-0 text-xl font-semibold text-indigo-300">${product.price.toFixed(2)}</span>
        </div>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-400">{product.description}</p>
        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            inCart
              ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
              : 'bg-white text-slate-950 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500'
          }`}
        >
          {outOfStock ? 'Currently unavailable' : inCart ? `In cart · ${inCart.quantity}` : 'Add to cart'}
        </button>
      </div>
    </article>
  );
};

const pageWindow = (page, totalPages) => {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
};

const ProductsPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useProducts({ ...filters, page, limit: 12 });
  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const updateFilters = (nextFilters) => {
    setFilters((current) => (typeof nextFilters === 'function' ? nextFilters(current) : nextFilters));
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    window.scrollTo({ top: 460, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="catalog-heading">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">The collection</p>
          <h2 id="catalog-heading" className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {filters.category || 'All products'}
          </h2>
        </div>
        <p className="text-sm text-slate-400" aria-live="polite">
          {filters.search ? `Results for “${filters.search}” · ` : ''}
          {total} {total === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="flex flex-col gap-7 lg:flex-row lg:items-start">
        <FilterSidebar filters={filters} onFilterChange={updateFilters} />
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading products">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] animate-pulse rounded-3xl border border-white/5 bg-white/[0.035]"
                />
              ))}
            </div>
          ) : isError ? (
            <div
              role="alert"
              className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-center text-rose-200"
            >
              We couldn’t load the collection. Check your connection and try again.
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
              <h3 className="text-xl font-semibold text-white">No products found</h3>
              <p className="mt-2 text-slate-400">Try widening your price range or clearing the active filters.</p>
              <button
                type="button"
                onClick={() => updateFilters(defaultFilters)}
                className="mt-5 font-semibold text-indigo-300 hover:text-indigo-200"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    Previous
                  </button>
                  {pageWindow(page, totalPages).map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      aria-current={pageNumber === page ? 'page' : undefined}
                      className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-semibold ${
                        pageNumber === page
                          ? 'bg-indigo-500 text-white'
                          : 'border border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-30"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
