import type { PropsWithChildren } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ToastViewport } from './ToastViewport';

export function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { email, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/auth', { replace: true });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/dashboard" className="brand-link">
          <span className="brand-mark">PK</span>
          <div>
            <p className="brand-title">Pokemon Favorites</p>
            <p className="brand-subtitle">Trainer Console</p>
          </div>
        </Link>

        <nav className="top-nav" aria-label="Main">
          <NavLink to="/dashboard" className="pill-link">
            Dashboard
          </NavLink>
          <NavLink to="/pokemon/new" className="pill-link">
            Add Pokemon
          </NavLink>
        </nav>

        <div className="account-box">
          <span>{email ?? 'Unknown user'}</span>
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="content">{children}</main>
      <ToastViewport />
    </div>
  );
}
