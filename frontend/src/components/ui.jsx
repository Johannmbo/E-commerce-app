import { useCallback, useEffect, useRef, useState, createContext, useContext } from 'react';

// ---------- chargement d'une ressource ----------
export function useList(loader) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ref = useRef(loader);
  ref.current = loader;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const d = await ref.current();
      setData(Array.isArray(d) ? d : []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}

// ---------- notifications ----------
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, kind = 'ok') => {
    const id = Math.random();
    setItems((xs) => [...xs, { id, message, kind }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- modale ----------
export function Modal({ title, onClose, children, footer, width = 520 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Confirm({ text, onConfirm, onClose, busy }) {
  return (
    <Modal
      title="Confirmer la suppression"
      onClose={onClose}
      width={420}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            Annuler
          </button>
          <button className="btn danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Suppression…' : 'Supprimer'}
          </button>
        </>
      }
    >
      <p className="muted">{text}</p>
    </Modal>
  );
}

// ---------- champs ----------
export function Field({ label, hint, children, wide }) {
  return (
    <label className={`field${wide ? ' wide' : ''}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

// ---------- états ----------
export function StateBlock({ loading, error, empty, onRetry, emptyText, emptyAction }) {
  if (loading) return <div className="state"><span className="spinner" /> Chargement…</div>;
  if (error)
    return (
      <div className="state state-error">
        <strong>Impossible de charger les données.</strong>
        <span className="muted small">{error}</span>
        {onRetry && (
          <button className="btn ghost sm" onClick={onRetry}>
            Réessayer
          </button>
        )}
      </div>
    );
  if (empty)
    return (
      <div className="state">
        <span className="muted">{emptyText}</span>
        {emptyAction}
      </div>
    );
  return null;
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export function Search({ value, onChange, placeholder = 'Rechercher…' }) {
  return (
    <input
      className="search"
      type="search"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      {onEdit && (
        <button className="btn ghost sm" onClick={onEdit}>
          Modifier
        </button>
      )}
      {onDelete && (
        <button className="btn ghost sm danger-text" onClick={onDelete}>
          Supprimer
        </button>
      )}
    </div>
  );
}

// Hook commun : enregistrement / suppression avec toast
export function useMutation(reload) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (fn, okMsg) => {
      setBusy(true);
      try {
        await fn();
        if (okMsg) toast(okMsg);
        await reload?.();
        return true;
      } catch (e) {
        toast(e.message, 'err');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [reload, toast]
  );
  return { busy, run };
}
