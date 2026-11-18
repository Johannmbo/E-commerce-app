import { useMemo, useState } from 'react';
import { api } from '../api.js';
import { Confirm, Field, Modal, PageHead, RowActions, Search, StateBlock, useList, useMutation } from '../components/ui.jsx';

const EMPTY = { name: '', email: '', address: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Customers() {
  const customers = useList(api.customers.list);
  const { busy, run } = useMutation(customers.reload);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return customers.data
      .filter((c) => !s || [c.name, c.email, c.address].some((v) => (v || '').toLowerCase().includes(s)))
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [customers.data, q]);

  const save = async () => {
    const f = editing.form;
    const payload = { name: f.name.trim(), email: f.email.trim(), address: f.address.trim() };
    const ok = await run(
      () => (editing.original ? api.customers.update({ ...payload, id: editing.original.id }) : api.customers.create(payload)),
      editing.original ? 'Client mis à jour' : 'Client ajouté'
    );
    if (ok) setEditing(null);
  };

  const f = editing?.form;
  const set = (k) => (e) => setEditing((s) => ({ ...s, form: { ...s.form, [k]: e.target.value } }));
  const emailBad = f && f.email && !EMAIL_RE.test(f.email.trim());
  const valid = f && f.name.trim() && !emailBad;

  return (
    <>
      <PageHead title="Clients" sub="Fichier clients du service customer-service.">
        <Search value={q} onChange={setQ} placeholder="Nom, e-mail, adresse…" />
        <button className="btn primary" onClick={() => setEditing({ form: { ...EMPTY }, original: null })}>
          + Nouveau client
        </button>
      </PageHead>

      <div className="card flush">
        <StateBlock
          loading={customers.loading && !customers.data.length}
          error={customers.error}
          onRetry={customers.reload}
          empty={!rows.length}
          emptyText={q ? 'Aucun client ne correspond.' : 'Aucun client enregistré.'}
        />
        {!customers.error && rows.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Client</th>
                <th>E-mail</th>
                <th>Adresse</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="mono muted">#{c.id}</td>
                  <td>
                    <span className="avatar">{initials(c.name)}</span>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</td>
                  <td>{c.address || '—'}</td>
                  <td>
                    <RowActions
                      onEdit={() =>
                        setEditing({ form: { name: c.name || '', email: c.email || '', address: c.address || '' }, original: c })
                      }
                      onDelete={() => setToDelete(c)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal
          title={editing.original ? 'Modifier le client' : 'Nouveau client'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
              <button className="btn primary" disabled={!valid || busy} onClick={save}>
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Nom *" wide>
              <input value={f.name} onChange={set('name')} autoFocus />
            </Field>
            <Field label="E-mail" wide hint={emailBad ? 'Adresse e-mail invalide.' : undefined}>
              <input type="email" value={f.email} onChange={set('email')} className={emailBad ? 'invalid' : ''} />
            </Field>
            <Field label="Adresse" wide>
              <textarea rows={2} value={f.address} onChange={set('address')} />
            </Field>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Confirm
          text={`Supprimer le client « ${toDelete.name} » ?`}
          busy={busy}
          onConfirm={async () => (await run(() => api.customers.remove(toDelete.id), 'Client supprimé')) && setToDelete(null)}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}

const initials = (n = '') =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';
