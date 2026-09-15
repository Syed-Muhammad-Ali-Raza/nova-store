import { useContext, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { confirmEnableTwoFactor, disableTwoFactor, enableTwoFactorSend } from '../api/auth';
import { queryKeys } from '../api/queryKeys';
import { Alert, FormField, PrimaryButton } from '../components/AuthUI';

const Account = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [challenge, setChallenge] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const refreshUser = () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
  const sendMutation = useMutation({
    mutationFn: enableTwoFactorSend,
    onSuccess: (data) => {
      setChallenge(data.challenge);
      setOtp('');
      setFeedback({ tone: 'info', message: 'A six-digit setup code was sent to your email.' });
    },
    onError: (error) =>
      setFeedback({ tone: 'error', message: error.response?.data?.message || 'Unable to send a setup code.' }),
  });
  const confirmMutation = useMutation({
    mutationFn: confirmEnableTwoFactor,
    onSuccess: async () => {
      await refreshUser();
      setChallenge('');
      setOtp('');
      setFeedback({ tone: 'success', message: 'Two-factor authentication is now enabled.' });
    },
    onError: (error) =>
      setFeedback({ tone: 'error', message: error.response?.data?.message || 'Unable to verify that code.' }),
  });
  const disableMutation = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: async () => {
      await refreshUser();
      setPassword('');
      setShowDisable(false);
      setFeedback({ tone: 'success', message: 'Two-factor authentication has been disabled.' });
    },
    onError: (error) =>
      setFeedback({
        tone: 'error',
        message: error.response?.data?.message || 'Unable to disable two-factor authentication.',
      }),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl py-4 sm:py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Security center</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Account protection</h1>
        <p className="mt-3 text-slate-400">
          Manage your identity and add another layer of protection to every sign-in.
        </p>
      </div>

      {feedback && (
        <div className="mb-6">
          <Alert tone={feedback.tone}>{feedback.message}</Alert>
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Verified email</h2>
            <p className="mt-1 text-sm text-slate-400">{user.email}</p>
          </div>
          <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            Verified
          </span>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-indigo-500/[0.04] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-semibold text-white">Email two-factor authentication</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              We’ll email a temporary six-digit code after your password is accepted.
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
              user.twoFactorEnabled
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                : 'border-white/10 bg-white/5 text-slate-400'
            }`}
          >
            {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {user.twoFactorEnabled ? (
          <div className="mt-7">
            {showDisable ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setFeedback(null);
                  disableMutation.mutate({ password });
                }}
                className="max-w-md space-y-4"
              >
                <FormField
                  id="disable-two-factor-password"
                  label="Confirm your password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <div className="flex gap-3">
                  <PrimaryButton
                    type="submit"
                    disabled={disableMutation.isPending || !password}
                    className="!w-auto !from-rose-500 !to-rose-600"
                  >
                    {disableMutation.isPending ? 'Disabling…' : 'Disable 2FA'}
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => setShowDisable(false)}
                    className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowDisable(true)}
                className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-400/10"
              >
                Disable two-factor authentication
              </button>
            )}
          </div>
        ) : challenge ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setFeedback(null);
              confirmMutation.mutate({ challenge, otp });
            }}
            className="mt-7 max-w-md space-y-4"
          >
            <FormField
              id="setup-two-factor-code"
              label="Six-digit setup code"
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              required
            />
            <div className="flex flex-wrap gap-3">
              <PrimaryButton type="submit" disabled={confirmMutation.isPending || otp.length !== 6} className="!w-auto">
                {confirmMutation.isPending ? 'Verifying…' : 'Confirm and enable'}
              </PrimaryButton>
              <button
                type="button"
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
              >
                {sendMutation.isPending ? 'Resending…' : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={() => setChallenge('')}
                className="px-2 py-3 text-sm text-slate-500 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <PrimaryButton
            type="button"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
            className="mt-7 !w-auto"
          >
            {sendMutation.isPending ? 'Sending setup code…' : 'Enable two-factor authentication'}
          </PrimaryButton>
        )}
      </section>
    </div>
  );
};

export default Account;
