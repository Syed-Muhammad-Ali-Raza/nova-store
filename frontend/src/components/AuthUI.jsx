/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';

export const BrandMark = ({ compact = false }) => (
  <Link to="/" className="inline-flex items-center gap-3 text-white" aria-label="NovStore home">
    <span
      className={`${compact ? 'h-9 w-9' : 'h-11 w-11'} grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-500/25`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7Z" />
      </svg>
    </span>
    <span className={`${compact ? 'text-lg' : 'text-xl'} font-bold tracking-tight`}>NovStore</span>
  </Link>
);

export const AuthLayout = ({ children, eyebrow = 'Secure shopping, beautifully simple' }) => (
  <main className="relative min-h-screen overflow-hidden bg-[#070912] px-4 py-8 text-white sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10">
    <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px]" />
    <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-600/15 blur-[110px]" />

    <section className="relative hidden min-h-[calc(100vh-5rem)] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-600/25 via-slate-900/70 to-violet-600/15 p-12 lg:flex">
      <BrandMark />
      <div className="max-w-xl">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">{eyebrow}</p>
        <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">
          Everything you love,
          <span className="block bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
            protected at every step.
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
          Verified accounts, secure recovery, and email two-factor authentication keep every NovStore visit yours.
        </p>
      </div>
      <div className="flex gap-6 text-sm text-slate-400">
        <span>Verified email</span>
        <span>Secure checkout</span>
        <span>2FA ready</span>
      </div>
    </section>

    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="mb-10 lg:hidden">
          <BrandMark />
        </div>
        {children}
      </div>
    </section>
  </main>
);

export const AuthHeader = ({ title, description }) => (
  <header className="mb-8">
    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
    {description && <p className="mt-3 leading-7 text-slate-400">{description}</p>}
  </header>
);

export const FormField = ({ id, label, hint, error, ...inputProps }) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </div>
    <input
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
      {...inputProps}
    />
    {error && (
      <p id={`${id}-error`} className="mt-2 text-sm text-rose-300">
        {error}
      </p>
    )}
  </div>
);

export const Alert = ({ tone = 'error', children }) => {
  const tones = {
    error: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
    success: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    info: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-200',
  };

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${tones[tone]}`}
    >
      {children}
    </div>
  );
};

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <button
    className={`inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const AuthCard = ({ children }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/65 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
    {children}
  </div>
);
