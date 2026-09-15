import { useContext, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Alert, AuthCard, AuthHeader, AuthLayout, FormField, PrimaryButton } from '../components/AuthUI';

const Register = () => {
  const { user, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const data = await register(email, password);
      navigate('/verify-email-sent', {
        state: { email, deliveryWarning: data.emailSent === false ? data.message : '' },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordIsValid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  return (
    <AuthLayout eyebrow="Create your secure NovStore account">
      <AuthCard>
        <AuthHeader
          title="Create your account"
          description="Save your cart, track orders, and secure your account with 2FA."
        />
        {error && <Alert>{error}</Alert>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <FormField
            id="register-email"
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <FormField
            id="register-password"
            label="Password"
            hint="8+ characters, letter and number"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <FormField
            id="register-confirm-password"
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : ''}
            required
          />
          <PrimaryButton
            type="submit"
            disabled={isSubmitting || !email || !passwordIsValid || password !== confirmPassword}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </PrimaryButton>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
