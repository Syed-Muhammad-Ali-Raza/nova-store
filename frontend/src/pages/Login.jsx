import { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { resendVerification } from '../api/auth';
import { Alert, AuthCard, AuthHeader, AuthLayout, FormField, PrimaryButton } from '../components/AuthUI';

const Login = () => {
  const { user, login, authenticating } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: (data) => setResendMessage(data.message),
    onError: (requestError) =>
      setError(requestError.response?.data?.message || 'Unable to resend the verification email.'),
  });

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResendMessage('');
    setIsUnverified(false);
    try {
      const data = await login(email, password);
      if (data.pendingTwoFactor) {
        navigate('/two-factor', { state: { challenge: data.challenge } });
        return;
      }
      navigate('/');
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Unable to sign in. Please try again.';
      setIsUnverified(message.toLowerCase().includes('verify your email'));
      setError(message);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title="Welcome back" description="Sign in to continue shopping and manage your orders." />
        <div className="space-y-4">
          {error && <Alert>{error}</Alert>}
          {resendMessage && <Alert tone="success">{resendMessage}</Alert>}
          {isUnverified && (
            <Alert tone="info">
              <div className="flex items-center justify-between gap-3">
                <span>Your account still needs email verification.</span>
                <button
                  type="button"
                  onClick={() => resendMutation.mutate({ email })}
                  disabled={resendMutation.isPending}
                  className="shrink-0 font-semibold text-white underline underline-offset-4 disabled:opacity-50"
                >
                  {resendMutation.isPending ? 'Sending…' : 'Resend'}
                </button>
              </div>
            </Alert>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <FormField
            id="login-email"
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <FormField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
              Forgot password?
            </Link>
          </div>
          <PrimaryButton type="submit" disabled={authenticating || !email || !password}>
            {authenticating ? 'Signing in…' : 'Sign in securely'}
          </PrimaryButton>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          New to NovStore?{' '}
          <Link to="/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
