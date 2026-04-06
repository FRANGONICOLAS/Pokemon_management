import { useToast } from '../hooks/useToast';

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <aside className="toast-stack" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast toast-${toast.tone}`}>
          <p>{toast.message}</p>
          <button
            type="button"
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss"
          >
            x
          </button>
        </article>
      ))}
    </aside>
  );
}
