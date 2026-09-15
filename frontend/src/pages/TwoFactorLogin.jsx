import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import { resendTwoFactor } from '../api/auth';
import { Alert, AuthCard, AuthHeader, AuthLayout, FormField, PrimaryButton } from '../components/AuthUI';

const TwoFactorLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, verifyTwoFactor } = useContext(AuthContext);
  const challenge = location.state?.challenge;
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState('error');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const verifyMutation = useMutation({
    mutationFn: ({ code }) => verifyTwoFactor(challenge, code),
    onSuccess: () => navigate('/', { replace: true }),
    onError: (requestError) => {
      setMessageTone('error');
      setMessage(requestError.response?.data?.message || 'Verification failed.');
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendTwoFactor,
    onSuccess: (data) => {
      setMessageTone('success');
      setMessage(data.message);
      setCooldown(30);
    },
    onError: (requestError) => {
      setMessageTone('error');
      setMessage(requestError.response?.data?.message || 'Unable to resend the code.');
    },
  });

  if (user) return <Navigate to="/" replace />;
  if (!challenge) return <Navigate to="/login" replace />;

  return (
    <AuthLayout eyebrow="One final security check">
      <AuthCard>
        <AuthHeader
          title="Enter your security code"
          description="We sent a six-digit code to your verified email. It expires in 10 minutes."
        />
        {message && <Alert tone={messageTone}>{message}</Alert>}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage('');
            verifyMutation.mutate({ code: otp });
          }}
          className="mt-6 space-y-5"
        >
          <FormField
            id="two-factor-code"
            label="Verification code"
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
          <PrimaryButton type="submit" disabled={verifyMutation.isPending || otp.length !== 6}>
            {verifyMutation.isPending ? 'Verifying…' : 'Verify and continue'}
          </PrimaryButton>
        </form>
        <div className="mt-7 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setMessage('');
              resendMutation.mutate({ challenge });
            }}
            disabled={resendMutation.isPending || cooldown > 0}
            className="font-semibold text-indigo-300 hover:text-indigo-200 disabled:text-slate-600"
          >
            {resendMutation.isPending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
          <span className="text-slate-700">•</span>
          <Link to="/login" className="text-slate-400 hover:text-white">
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default TwoFactorLogin;
