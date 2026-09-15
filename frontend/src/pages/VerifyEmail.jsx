import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth';
import { Alert, AuthCard, AuthHeader, AuthLayout } from '../components/AuthUI';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is missing its secure token.');
      return;
    }

    let active = true;
    verifyEmail(token)
      .then((data) => {
        if (active) {
          setStatus('success');
          setMessage(data.message);
        }
      })
      .catch((requestError) => {
        if (active) {
          setStatus('error');
          setMessage(requestError.response?.data?.message || 'Unable to verify this email address.');
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthLayout eyebrow="Email verification">
      <AuthCard>
        {status === 'verifying' && (
          <div role="status" aria-live="polite" className="py-8 text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-indigo-400" />
            <AuthHeader title="Verifying your email" description="This should only take a moment." />
          </div>
        )}
        {status === 'success' && (
          <>
            <AuthHeader title="Email verified" description="Your account is ready. Sign in to explore NovStore." />
            <Alert tone="success">{message}</Alert>
            <Link
              to="/login"
              className="mt-6 block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-center font-semibold text-white"
            >
              Continue to sign in
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <AuthHeader
              title="Verification link unavailable"
              description="The link may be invalid, expired, or already replaced by a newer one."
            />
            <Alert>{message}</Alert>
            <Link
              to="/verify-email-sent"
              className="mt-6 block text-center font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Request a new verification link
            </Link>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmail;
