import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../api/auth';
import { Alert, AuthCard, AuthHeader, AuthLayout, FormField, PrimaryButton } from '../components/AuthUI';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setSubmittedEmail(email);
      setError('');
    },
    onError: (requestError) => setError(requestError.response?.data?.message || 'Unable to request a reset link.'),
  });

  return (
    <AuthLayout eyebrow="Secure account recovery">
      <AuthCard>
        {submittedEmail ? (
          <>
            <AuthHeader
              title="Check your inbox"
              description={`If an account exists for ${submittedEmail}, a secure reset link is on its way.`}
            />
            <Alert tone="success">
              The link expires in one hour. You can safely close this page after opening the email.
            </Alert>
            <button
              type="button"
              onClick={() => setSubmittedEmail('')}
              className="mt-6 w-full rounded-xl border border-white/10 px-4 py-3 font-medium text-slate-200 transition hover:bg-white/5"
            >
              Try another email
            </button>
          </>
        ) : (
          <>
            <AuthHeader
              title="Reset your password"
              description="Enter your account email and we’ll send a single-use recovery link."
            />
            {error && <Alert>{error}</Alert>}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setError('');
                mutation.mutate({ email });
              }}
              className="mt-6 space-y-5"
            >
              <FormField
                id="forgot-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <PrimaryButton type="submit" disabled={mutation.isPending || !email}>
                {mutation.isPending ? 'Sending secure link…' : 'Send reset link'}
              </PrimaryButton>
            </form>
          </>
        )}
        <p className="mt-7 text-center text-sm text-slate-400">
          <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
