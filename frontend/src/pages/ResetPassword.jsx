import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../api/auth';
import { Alert, AuthCard, AuthHeader, AuthLayout, FormField, PrimaryButton } from '../components/AuthUI';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setMessage(data.message);
      setIsComplete(true);
    },
    onError: (requestError) => setMessage(requestError.response?.data?.message || 'Unable to reset your password.'),
  });

  const passwordIsValid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  return (
    <AuthLayout eyebrow="Choose a new secure password">
      <AuthCard>
        {!token ? (
          <>
            <AuthHeader
              title="Invalid reset link"
              description="This password reset link is missing its secure token."
            />
            <Alert>Request a fresh link to continue.</Alert>
            <Link
              to="/forgot-password"
              className="mt-6 block text-center font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Request a new link
            </Link>
          </>
        ) : isComplete ? (
          <>
            <AuthHeader title="Password updated" description="Your new password is ready to use." />
            <Alert tone="success">{message}</Alert>
            <Link
              to="/login"
              className="mt-6 block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-center font-semibold text-white"
            >
              Continue to sign in
            </Link>
          </>
        ) : (
          <>
            <AuthHeader
              title="Create a new password"
              description="Use a password you haven’t used for this account before."
            />
            {message && <Alert>{message}</Alert>}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setMessage('');
                mutation.mutate({ token, password });
              }}
              className="mt-6 space-y-5"
            >
              <FormField
                id="reset-password"
                label="New password"
                hint="8+ characters, letter and number"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <FormField
                id="reset-confirm-password"
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : ''}
                required
              />
              <PrimaryButton
                type="submit"
                disabled={mutation.isPending || !passwordIsValid || password !== confirmPassword}
              >
                {mutation.isPending ? 'Updating password…' : 'Update password'}
              </PrimaryButton>
            </form>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPassword;
