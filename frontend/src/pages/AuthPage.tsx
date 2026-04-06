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
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [loginSubmitError, setLoginSubmitError] = useState('');
  const [registerSubmitError, setRegisterSubmitError] = useState('');

  function EyeIcon({ open }: { open: boolean }) {
    return open ? (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none">
        <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none">
        <path d="M2 2l20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.1 4.5A13 13 0 0 1 12 4c7 0 10.5 8 10.5 8a16.4 16.4 0 0 1-3.7 4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.2 6.2C3.7 8 2 12 2 12s3.5 8 10 8a11 11 0 0 0 3.4-.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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

  function getFriendlyLoginError(message: string): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid email')) {
      return 'No encontramos una cuenta con ese correo.';
    }

    if (normalized.includes('invalid password')) {
      return 'La contraseña es incorrecta.';
    }

    if (normalized.includes('unauthorized')) {
      return 'Correo o contraseña incorrectos.';
    }

    return 'No se pudo iniciar sesión. Verifica tus credenciales.';
  }

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
    setLoginSubmitError('');

    if (loginError) {
      setLoginSubmitError(loginError);
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      pushToast('Welcome back trainer!', 'success');
      navigate(from ?? '/dashboard', { replace: true });
    } catch (error) {
      const friendlyError = getFriendlyLoginError(getErrorMessage(error));
      setLoginSubmitError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterSubmitError('');

    if (registerError) {
      setRegisterSubmitError(registerError);
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
      setRegisterSubmitError(getErrorMessage(error));
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
              <div className="password-field">
                <input
                  type={loginPasswordVisible ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={loginPasswordVisible ? 'Hide password' : 'Show password'}
                  onClick={() => setLoginPasswordVisible((value) => !value)}
                >
                  <EyeIcon open={loginPasswordVisible} />
                </button>
              </div>
            </label>

            {loginError ? <p className="inline-error">{loginError}</p> : null}
            {loginSubmitError ? <p className="inline-error">{loginSubmitError}</p> : null}

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
              <div className="password-field">
                <input
                  type={registerPasswordVisible ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="Strong password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={registerPasswordVisible ? 'Hide password' : 'Show password'}
                  onClick={() => setRegisterPasswordVisible((value) => !value)}
                >
                  <EyeIcon open={registerPasswordVisible} />
                </button>
              </div>
            </label>

            {registerError ? <p className="inline-error">{registerError}</p> : null}
            {registerSubmitError ? <p className="inline-error">{registerSubmitError}</p> : null}

            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create account'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
