import { useMemo, useState } from 'react';
import { api, fmtDate, money, toInputDate, today } from '../api.js';
import { Confirm, Field, Modal, PageHead, RowActions, StateBlock, useList, useMutation } from '../components/ui.jsx';

export default function Bills() {
  const bills = useList(api.bills.list);
  const lines = useList(api.productItems.list);
  const customers = useList(api.customers.list);
  const products = useList(api.products.list);
  const discounts = useList(api.discounts.list);
  const reloadAll = async () => Promise.all([bills.reload(), lines.reload()]);
  const { busy, run } = useMutation(reloadAll);

  const [tab, setTab] = useState('bills');
  const [billEdit, setBillEdit] = useState(null);
  const [lineEdit, setLineEdit] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const customerById = useMemo(() => Object.fromEntries(customers.data.map((c) => [c.id, c])), [customers.data]);
  const productByRef = useMemo(() => Object.fromEntries(products.data.map((p) => [p.productId, p])), [products.data]);
  const discountByRef = useMemo(
    () => Object.fromEntries(discounts.data.map((d) => [d.productId, d.discountPercent])),
    [discounts.data]
  );

  const total = lines.data.reduce((s, l) => s + l.price * l.quantity, 0);

  const saveBill = async () => {
    const f = billEdit.form;
    const payload = { billingDate: f.billingDate || null, customerId: Number(f.customerId) };
    const ok = await run(
      () => (billEdit.original ? api.bills.update({ ...payload, id: billEdit.original.id }) : api.bills.create(payload)),
      billEdit.original ? 'Facture mise à jour' : 'Facture créée'
    );
    if (ok) setBillEdit(null);
  };

  const saveLine = async () => {
    const f = lineEdit.form;
    const p = productByRef[f.productId];
    const payload = {
      productId: f.productId,
      price: parseInt(f.price, 10) || 0,
      quantity: parseInt(f.quantity, 10) || 0,
    };
    const ok = await run(
      () =>
        lineEdit.original
          ? api.productItems.update({ ...payload, id: lineEdit.original.id, productName: p?.name || lineEdit.original.productName })
          : api.productItems.create(payload),
      lineEdit.original ? 'Ligne mise à jour' : 'Ligne ajoutée'
    );
    if (ok) setLineEdit(null);
  };

  const unitPrice = (ref) => {
    const p = productByRef[ref];
    if (!p) return '';
    const pct = discountByRef[ref] || 0;
    return String(Math.round(p.price * (1 - pct / 100)));
  };

  const bf = billEdit?.form;
  const lf = lineEdit?.form;

  return (
    <>
      <PageHead title="Factures" sub="Facturation du service billing-service.">
        {tab === 'bills' ? (
          <button
            className="btn primary"
            disabled={!customers.data.length}
            title={!customers.data.length ? 'Créez d’abord un client' : undefined}
            onClick={() =>
              setBillEdit({ form: { billingDate: today(), customerId: String(customers.data[0]?.id ?? '') }, original: null })
            }
          >
            + Nouvelle facture
          </button>
        ) : (
          <button
            className="btn primary"
            disabled={!products.data.length}
            title={!products.data.length ? 'Ajoutez d’abord un produit' : undefined}
            onClick={() => {
              const ref = products.data[0]?.productId || '';
              setLineEdit({ form: { productId: ref, price: unitPrice(ref), quantity: '1' }, original: null });
            }}
          >
            + Nouvelle ligne
          </button>
        )}
      </PageHead>

      <div className="tabs">
        <button className={tab === 'bills' ? 'active' : ''} onClick={() => setTab('bills')}>
          Factures <span className="count">{bills.data.length}</span>
        </button>
        <button className={tab === 'lines' ? 'active' : ''} onClick={() => setTab('lines')}>
          Lignes facturées <span className="count">{lines.data.length}</span>
        </button>
      </div>

      {tab === 'bills' && (
        <div className="card flush">
          <StateBlock
            loading={bills.loading && !bills.data.length}
            error={bills.error}
            onRetry={reloadAll}
            empty={!bills.data.length}
            emptyText="Aucune facture."
          />
          {!bills.error && bills.data.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...bills.data]
                  .sort((a, b) => b.id - a.id)
                  .map((b) => {
                    const c = customerById[b.customerId];
                    return (
                      <tr key={b.id}>
                        <td className="mono">FAC-{String(b.id).padStart(4, '0')}</td>
                        <td>{fmtDate(b.billingDate)}</td>
                        <td>
                          {c ? (
                            <>
                              <strong>{c.name}</strong>
                              {c.email && <div className="muted small">{c.email}</div>}
                            </>
                          ) : (
                            <span className="muted">Client #{b.customerId} (introuvable)</span>
                          )}
                        </td>
                        <td>
                          <RowActions
                            onEdit={() =>
                              setBillEdit({
                                form: { billingDate: toInputDate(b.billingDate), customerId: String(b.customerId) },
                                original: b,
                              })
                            }
                            onDelete={() => setToDelete({ kind: 'bill', obj: b })}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'lines' && (
        <>
          <p className="notice">
            Les lignes sont enregistrées sans lien vers leur facture (le champ <code>bill</code> n’est pas persisté par{' '}
            <code>ProductItemService.create</code>). Le nom du produit est retrouvé dans l’inventaire grâce à la référence.
          </p>
          <div className="card flush">
            <StateBlock
              loading={lines.loading && !lines.data.length}
              error={lines.error}
              onRetry={lines.reload}
              empty={!lines.data.length}
              emptyText="Aucune ligne facturée."
            />
            {!lines.error && lines.data.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Produit</th>
                    <th className="num">Prix unitaire</th>
                    <th className="num">Qté</th>
                    <th className="num">Sous-total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...lines.data]
                    .sort((a, b) => a.id - b.id)
                    .map((l) => {
                      const p = productByRef[l.productId];
                      return (
                        <tr key={l.id}>
                          <td className="mono muted">#{l.id}</td>
                          <td>
                            <strong>{p ? p.name : 'Produit inconnu'}</strong>
                            <div className="muted small mono">{l.productId}</div>
                          </td>
                          <td className="num">{money(l.price)}</td>
                          <td className="num">{l.quantity}</td>
                          <td className="num">
                            <strong>{money(l.price * l.quantity)}</strong>
                          </td>
                          <td>
                            <RowActions
                              onEdit={() =>
                                setLineEdit({
                                  form: { productId: l.productId, price: String(l.price), quantity: String(l.quantity) },
                                  original: l,
                                })
                              }
                              onDelete={() => setToDelete({ kind: 'line', obj: l })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="num">
                      Total facturé
                    </td>
                    <td className="num">
                      <strong>{money(total)}</strong>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}

      {billEdit && (
        <Modal
          title={billEdit.original ? `Facture FAC-${String(billEdit.original.id).padStart(4, '0')}` : 'Nouvelle facture'}
          onClose={() => setBillEdit(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setBillEdit(null)}>
                Annuler
              </button>
              <button className="btn primary" disabled={busy || !bf.customerId} onClick={saveBill}>
                Enregistrer
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Date de facturation">
              <input
                type="date"
                value={bf.billingDate}
                onChange={(e) => setBillEdit((s) => ({ ...s, form: { ...s.form, billingDate: e.target.value } }))}
              />
            </Field>
            <Field label="Client *">
              <select
                value={bf.customerId}
                onChange={(e) => setBillEdit((s) => ({ ...s, form: { ...s.form, customerId: e.target.value } }))}
              >
                {!customerById[bf.customerId] && <option value={bf.customerId}>Client #{bf.customerId}</option>}
                {customers.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {lineEdit && (
        <Modal
          title={lineEdit.original ? `Ligne #${lineEdit.original.id}` : 'Nouvelle ligne facturée'}
          onClose={() => setLineEdit(null)}
          footer={
            <>
              <span className="muted push">
                Sous-total : <strong>{money((parseInt(lf.price, 10) || 0) * (parseInt(lf.quantity, 10) || 0))}</strong>
              </span>
              <button className="btn ghost" onClick={() => setLineEdit(null)}>
                Annuler
              </button>
              <button
                className="btn primary"
                disabled={busy || !lf.productId || !(parseInt(lf.quantity, 10) > 0) || lf.price === ''}
                onClick={saveLine}
              >
                Enregistrer
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Produit *" wide>
              <select
                value={lf.productId}
                onChange={(e) =>
                  setLineEdit((s) => ({ ...s, form: { ...s.form, productId: e.target.value, price: unitPrice(e.target.value) } }))
                }
              >
                {!productByRef[lf.productId] && <option value={lf.productId}>{lf.productId || '—'}</option>}
                {products.data.map((p) => (
                  <option key={p.id} value={p.productId}>
                    {p.name} ({p.productId}){discountByRef[p.productId] ? ` · −${discountByRef[p.productId]}%` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prix unitaire (€)" hint="Pré-rempli avec le prix remisé">
              <input
                type="number"
                min="0"
                step="1"
                value={lf.price}
                onChange={(e) => setLineEdit((s) => ({ ...s, form: { ...s.form, price: e.target.value } }))}
              />
            </Field>
            <Field label="Quantité *">
              <input
                type="number"
                min="1"
                step="1"
                value={lf.quantity}
                onChange={(e) => setLineEdit((s) => ({ ...s, form: { ...s.form, quantity: e.target.value } }))}
              />
            </Field>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Confirm
          text={toDelete.kind === 'bill' ? `Supprimer la facture FAC-${String(toDelete.obj.id).padStart(4, '0')} ?` : `Supprimer la ligne #${toDelete.obj.id} ?`}
          busy={busy}
          onConfirm={async () => {
            const ok = await run(
              () => (toDelete.kind === 'bill' ? api.bills.remove(toDelete.obj.id) : api.productItems.remove(toDelete.obj.id)),
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
