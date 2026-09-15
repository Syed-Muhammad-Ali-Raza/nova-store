import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resendVerification } from '../api/auth';
import { Alert, AuthCard, AuthHeader, AuthLayout, FormField, PrimaryButton } from '../components/AuthUI';

const VerifyEmailSent = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [message, setMessage] = useState(location.state?.deliveryWarning || '');
  const [tone, setTone] = useState(location.state?.deliveryWarning ? 'error' : 'info');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const mutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: (data) => {
      setTone('success');
      setMessage(data.message);
      setCooldown(30);
    },
    onError: (requestError) => {
      setTone('error');
      setMessage(requestError.response?.data?.message || 'Unable to resend the verification email.');
    },
  });

  return (
    <AuthLayout eyebrow="Verify your email address">
      <AuthCard>
        <AuthHeader
          title="Check your inbox"
          description={
            email
              ? `We sent a verification link to ${email}.`
              : 'Enter your email to request a fresh verification link.'
          }
        />
        {message && <Alert tone={tone}>{message}</Alert>}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage('');
            mutation.mutate({ email });
          }}
          className="mt-6 space-y-5"
        >
          <FormField
            id="verification-email"
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <PrimaryButton type="submit" disabled={mutation.isPending || cooldown > 0 || !email}>
            {mutation.isPending
              ? 'Sending…'
              : cooldown > 0
                ? `Resend available in ${cooldown}s`
                : 'Resend verification email'}
          </PrimaryButton>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">
          Already verified?{' '}
          <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmailSent;
