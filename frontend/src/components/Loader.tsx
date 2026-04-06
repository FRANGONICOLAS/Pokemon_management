export function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <span className="loader" />
      <p>{label}</p>
    </div>
  );
}
