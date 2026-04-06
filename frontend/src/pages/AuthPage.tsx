import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../lib/errors';
import { isStrongPassword, isValidEmail } from '../lib/validation';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from as string | undefined;
  const { isAuthenticated, login, register } = useAuth();
  const { pushToast } = useToast();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const loginError = useMemo(() => {
    if (!loginEmail || !loginPassword) {
      return null;
    }

    if (!isValidEmail(loginEmail)) {
      return 'Use a valid email address';
    }

    if (loginPassword.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  }, [loginEmail, loginPassword]);

  const registerError = useMemo(() => {
    if (!name || !registerEmail || !registerPassword) {
      return null;
    }

    if (name.trim().length < 2) {
      return 'Name must have at least 2 characters';
    }

    if (!isValidEmail(registerEmail)) {
      return 'Use a valid email address';
    }

    if (!isStrongPassword(registerPassword)) {
      return 'Password must contain uppercase, lowercase, number, symbol and no spaces';
    }

    return null;
  }, [name, registerEmail, registerPassword]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loginError) {
      pushToast(loginError, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: loginEmail.trim(), password: loginPassword, remember });
      pushToast('Welcome back trainer!', 'success');
      navigate(from ?? '/dashboard', { replace: true });
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (registerError) {
      pushToast(registerError, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
      });

      pushToast('Account created. Now login with your credentials.', 'success');
      setTab('login');
      setLoginEmail(registerEmail.trim());
      setLoginPassword('');
      setRegisterPassword('');
    } catch (error) {
      pushToast(getErrorMessage(error), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-screen">
      <section className="auth-panel">
        <header className="auth-header">
          <span className="badge">Pokemon Management</span>
          <h1>Train your personal favorites vault</h1>
          <p>Login or create your account to manage notes, comments and pokemon details.</p>
        </header>

        <div className="tab-row">
          <button
            type="button"
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        {tab === 'login' ? (
          <form className="form-grid" onSubmit={handleLoginSubmit} noValidate>
            <label>
              Email
              <input
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="ash@kanto.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Your password"
                required
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Keep session in localStorage
            </label>

            {loginError ? <p className="inline-error">{loginError}</p> : null}

            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleRegisterSubmit} noValidate>
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ash Ketchum"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                placeholder="ash@kanto.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                placeholder="Strong password"
                required
              />
            </label>

            {registerError ? <p className="inline-error">{registerError}</p> : null}

            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create account'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
