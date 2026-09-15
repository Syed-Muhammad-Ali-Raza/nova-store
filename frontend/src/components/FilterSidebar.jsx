/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

const categories = ['Electronics', 'Furniture', 'Accessories', 'Audio', 'Wearables', 'General'];
const sortOptions = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];
const emptyFilters = { search: '', category: '', minPrice: '', maxPrice: '', inStock: '', sortBy: 'newest' };

const FilterContent = ({ filters, onChange, onClear, onClose }) => (
  <div className="space-y-7">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Refine</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Shop your way</h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white lg:hidden"
        aria-label="Close filters"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div>
      <label htmlFor="product-search" className="mb-2 block text-sm font-medium text-slate-300">
        Search
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeWidth="2"
            d="m21 21-4.4-4.4m2.4-5.1A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z"
          />
        </svg>
        <input
          id="product-search"
          type="search"
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Search the collection"
          className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>
    </div>

    <fieldset>
      <legend className="mb-3 text-sm font-medium text-slate-300">Category</legend>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = filters.category === category;
          return (
            <button
              type="button"
              key={category}
              aria-pressed={active}
              onClick={() => onChange('category', active ? '' : category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-indigo-400/40 bg-indigo-400/15 text-indigo-200'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </fieldset>

    <fieldset>
      <legend className="mb-3 text-sm font-medium text-slate-300">Price range</legend>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="sr-only">Minimum price</span>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => onChange('minPrice', event.target.value)}
            placeholder="Min $"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
          />
        </label>
        <label>
          <span className="sr-only">Maximum price</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => onChange('maxPrice', event.target.value)}
            placeholder="Max $"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
          />
        </label>
      </div>
    </fieldset>

    <div>
      <label htmlFor="product-sort" className="mb-2 block text-sm font-medium text-slate-300">
        Sort by
      </label>
      <select
        id="product-sort"
        value={filters.sortBy}
        onChange={(event) => onChange('sortBy', event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#0d1120] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/15 p-3">
      <span className="text-sm font-medium text-slate-300">In-stock only</span>
      <input
        type="checkbox"
        checked={filters.inStock === 'true'}
        onChange={(event) => onChange('inStock', event.target.checked ? 'true' : '')}
        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
      />
    </label>

    <button
      type="button"
      onClick={onClear}
      className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
    >
      Clear all filters
    </button>
  </div>
);

const FilterSidebar = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll('button, input, select, [href], [tabindex]:not([tabindex="-1"])') || [];
    focusable[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleChange = (key, value) => onFilterChange((current) => ({ ...current, [key]: value }));

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white lg:hidden"
        aria-haspopup="dialog"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M7 12h10m-7 6h4" />
        </svg>
        Filters
      </button>

      <aside className="hidden w-72 shrink-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:sticky lg:top-28 lg:block">
        <FilterContent filters={filters} onChange={handleChange} onClear={() => onFilterChange(emptyFilters)} />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close filters"
          />
          <aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
            className="absolute inset-y-0 left-0 w-[min(88vw,22rem)] overflow-y-auto border-r border-white/10 bg-[#0b0e19] p-6 shadow-2xl"
          >
            <FilterContent
              filters={filters}
              onChange={handleChange}
              onClear={() => onFilterChange(emptyFilters)}
              onClose={() => setIsOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
