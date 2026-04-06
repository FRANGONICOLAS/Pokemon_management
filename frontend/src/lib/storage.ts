const TOKEN_LOCAL_KEY = 'pokemon_token_local';
const TOKEN_SESSION_KEY = 'pokemon_token_session';
const EMAIL_KEY = 'pokemon_email';

export function saveAuthSession(token: string, email: string, remember: boolean): void {
  clearAuthSession();

  if (remember) {
    localStorage.setItem(TOKEN_LOCAL_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_SESSION_KEY, token);
  }

  localStorage.setItem(EMAIL_KEY, email);
}

export function loadAuthSession(): { token: string | null; email: string | null } {
  const tokenFromLocal = localStorage.getItem(TOKEN_LOCAL_KEY);
  const tokenFromSession = sessionStorage.getItem(TOKEN_SESSION_KEY);

  return {
    token: tokenFromLocal ?? tokenFromSession,
    email: localStorage.getItem(EMAIL_KEY),
  };
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_LOCAL_KEY);
  sessionStorage.removeItem(TOKEN_SESSION_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
