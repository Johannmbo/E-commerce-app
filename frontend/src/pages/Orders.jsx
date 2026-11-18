import { useMemo, useState } from 'react';
import { api, fmtDate, toInputDate, today } from '../api.js';
import { Confirm, Field, Modal, PageHead, RowActions, Search, StateBlock, useList, useMutation } from '../components/ui.jsx';
import { statusClass } from './Dashboard.jsx';

const STATUSES = ['NOUVELLE', 'EN COURS', 'EXPÉDIÉE', 'LIVRÉE', 'ANNULÉE'];
const TYPES = ['EN LIGNE', 'MAGASIN', 'TÉLÉPHONE'];

export default function Orders() {
  const orders = useList(api.orders.list);
  const items = useList(api.orderItems.list);
  const reloadAll = async () => Promise.all([orders.reload(), items.reload()]);
  const { busy, run } = useMutation(reloadAll);
  const [tab, setTab] = useState('orders');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [itemEdit, setItemEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const allStatuses = useMemo(
    () => [...new Set([...STATUSES, ...orders.data.map((o) => o.orderStatus).filter(Boolean)])],
    [orders.data]
  );

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.data
      .filter((o) => !status || o.orderStatus === status)
      .filter((o) => !s || `#${o.id} ${o.orderType} ${o.orderStatus}`.toLowerCase().includes(s))
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [orders.data, q, status]);

  const saveOrder = async () => {
    const f = editing.form;
    const payload = { orderDate: f.orderDate || null, orderStatus: f.orderStatus, orderType: f.orderType };
    const ok = await run(
      () =>
        editing.original
          ? api.orders.update({ ...payload, id: editing.original.id })
          : api.orders.create(payload),
      editing.original ? 'Commande mise à jour' : 'Commande créée'
    );
    if (ok) setEditing(null);
  };

  const quickStatus = (o, s) =>
    run(() => api.orders.update({ id: o.id, orderDate: o.orderDate, orderType: o.orderType, orderStatus: s }), `Commande #${o.id} : ${s}`);

  const saveItem = async () => {
    const qty = parseInt(itemEdit.form.quantity, 10) || 0;
    const ok = await run(
      () =>
        itemEdit.original
          ? api.orderItems.update({ id: itemEdit.original.id, quantity: qty })
          : api.orderItems.create({ quantity: qty }),
      itemEdit.original ? 'Ligne mise à jour' : 'Ligne ajoutée'
    );
    if (ok) setItemEdit(null);
  };

  const f = editing?.form;
  const set = (k) => (e) => setEditing((s) => ({ ...s, form: { ...s.form, [k]: e.target.value } }));

  return (
    <>
      <PageHead title="Commandes" sub="Suivi des commandes du service order-service.">
        {tab === 'orders' ? (
          <>
            <Search value={q} onChange={setQ} placeholder="N°, type…" />
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrer par statut">
              <option value="">Tous les statuts</option>
              {allStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button
              className="btn primary"
              onClick={() =>
                setEditing({ form: { orderDate: today(), orderStatus: STATUSES[0], orderType: TYPES[0] }, original: null })
              }
            >
              + Nouvelle commande
            </button>
          </>
        ) : (
          <button className="btn primary" onClick={() => setItemEdit({ form: { quantity: '1' }, original: null })}>
            + Nouvelle ligne
          </button>
        )}
      </PageHead>

      <div className="tabs">
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Commandes <span className="count">{orders.data.length}</span>
        </button>
        <button className={tab === 'items' ? 'active' : ''} onClick={() => setTab('items')}>
          Lignes de commande <span className="count">{items.data.length}</span>
        </button>
      </div>

      {tab === 'orders' && (
        <div className="card flush">
          <StateBlock
            loading={orders.loading && !orders.data.length}
            error={orders.error}
            onRetry={reloadAll}
            empty={!rows.length}
            emptyText={q || status ? 'Aucune commande ne correspond aux filtres.' : 'Aucune commande.'}
          />
          {!orders.error && rows.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th className="num">Lignes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">#{o.id}</td>
                    <td>{fmtDate(o.orderDate)}</td>
                    <td>{o.orderType || '—'}</td>
                    <td>
                      <select
                        className={`badge-select ${statusClass(o.orderStatus)}`}
                        value={o.orderStatus || ''}
                        onChange={(e) => quickStatus(o, e.target.value)}
                        aria-label={`Statut de la commande ${o.id}`}
                      >
                        {!o.orderStatus && <option value="">—</option>}
                        {allStatuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="num">{Array.isArray(o.orderItem) ? o.orderItem.length : 0}</td>
                    <td>
                      <RowActions
                        onEdit={() =>
                          setEditing({
                            form: {
                              orderDate: toInputDate(o.orderDate),
                              orderStatus: o.orderStatus || STATUSES[0],
                              orderType: o.orderType || TYPES[0],
                            },
                            original: o,
                          })
                        }
                        onDelete={() => setToDelete({ kind: 'order', obj: o })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'items' && (
        <>
          <p className="notice">
            Le service enregistre la quantité des lignes, mais pas encore la commande à laquelle elles appartiennent
            (<code>orderId</code> est ignoré par <code>OrderItemService.create</code>). Elles sont donc listées à part.
          </p>
          <div className="card flush">
            <StateBlock
              loading={items.loading && !items.data.length}
              error={items.error}
              onRetry={items.reload}
              empty={!items.data.length}
              emptyText="Aucune ligne de commande."
            />
            {!items.error && items.data.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>N° ligne</th>
                    <th className="num">Quantité</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...items.data]
                    .sort((a, b) => a.id - b.id)
                    .map((i) => (
                      <tr key={i.id}>
                        <td className="mono">#{i.id}</td>
                        <td className="num">{i.quantity}</td>
                        <td>
                          <RowActions
                            onEdit={() => setItemEdit({ form: { quantity: String(i.quantity) }, original: i })}
                            onDelete={() => setToDelete({ kind: 'item', obj: i })}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {editing && (
        <Modal
          title={editing.original ? `Commande #${editing.original.id}` : 'Nouvelle commande'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
              <button className="btn primary" disabled={busy || !f.orderStatus} onClick={saveOrder}>
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Date de commande">
              <input type="date" value={f.orderDate} onChange={set('orderDate')} />
            </Field>
            <Field label="Type">
              <select value={f.orderType} onChange={set('orderType')}>
                {[...new Set([...TYPES, f.orderType])].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Statut" wide>
              <div className="chips">
                {allStatuses.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`chip ${f.orderStatus === s ? 'on' : ''}`}
                    onClick={() => setEditing((st) => ({ ...st, form: { ...st.form, orderStatus: s } }))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </Modal>
      )}

      {itemEdit && (
        <Modal
          title={itemEdit.original ? `Ligne #${itemEdit.original.id}` : 'Nouvelle ligne de commande'}
          onClose={() => setItemEdit(null)}
          width={380}
          footer={
            <>
              <button className="btn ghost" onClick={() => setItemEdit(null)}>
                Annuler
              </button>
              <button
                className="btn primary"
                disabled={busy || !(parseInt(itemEdit.form.quantity, 10) > 0)}
                onClick={saveItem}
              >
                Enregistrer
              </button>
            </>
          }
        >
          <Field label="Quantité *">
            <input
              type="number"
              min="1"
              step="1"
              autoFocus
              value={itemEdit.form.quantity}
              onChange={(e) => setItemEdit((s) => ({ ...s, form: { quantity: e.target.value } }))}
            />
          </Field>
        </Modal>
      )}

      {toDelete && (
        <Confirm
          text={toDelete.kind === 'order' ? `Supprimer la commande #${toDelete.obj.id} ?` : `Supprimer la ligne #${toDelete.obj.id} ?`}
          busy={busy}
          onConfirm={async () => {
            const ok = await run(
              () => (toDelete.kind === 'order' ? api.orders.remove(toDelete.obj.id) : api.orderItems.remove(toDelete.obj.id)),
              'Supprimé'
            );
            if (ok) setToDelete(null);
          }}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
