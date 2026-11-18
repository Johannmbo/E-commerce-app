import { useMemo, useState } from 'react';
import { api, money } from '../api.js';
import { Confirm, Field, Modal, PageHead, RowActions, Search, StateBlock, useList, useMutation } from '../components/ui.jsx';

const EMPTY = { productId: '', name: '', description: '', quality: '', price: '', discount: '' };

export default function Products() {
  const products = useList(api.products.list);
  const discounts = useList(api.discounts.list);
  const reloadAll = async () => {
    await Promise.all([products.reload(), discounts.reload()]);
  };
  const { busy, run } = useMutation(reloadAll);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | {form, original}
  const [toDelete, setToDelete] = useState(null);

  // Le service ne lie pas encore Product.discount : on rapproche par productId
  const discountByProduct = useMemo(() => {
    const m = {};
    for (const d of discounts.data) if (d.productId) m[d.productId] = d;
    return m;
  }, [discounts.data]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.data
      .filter((p) => !s || [p.name, p.productId, p.description, p.quality].some((v) => (v || '').toLowerCase().includes(s)))
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [products.data, q]);

  const openNew = () => setEditing({ form: { ...EMPTY }, original: null });
  const openEdit = (p) => {
    const d = discountByProduct[p.productId];
    setEditing({
      form: {
        productId: p.productId || '',
        name: p.name || '',
        description: p.description || '',
        quality: p.quality || '',
        price: String(p.price ?? ''),
        discount: d ? String(d.discountPercent) : '',
      },
      original: p,
    });
  };

  const save = async () => {
    const f = editing.form;
    const payload = {
      productId: f.productId.trim(),
      name: f.name.trim(),
      description: f.description.trim(),
      quality: f.quality.trim(),
      price: parseInt(f.price, 10) || 0,
    };
    const pct = f.discount === '' ? null : Math.max(0, Math.min(100, parseInt(f.discount, 10) || 0));
    const ok = await run(async () => {
      if (editing.original) {
        await api.products.update({ ...payload, id: editing.original.id, discount: null });
      } else {
        await api.products.create(payload);
      }
      // synchronise la remise (liée par productId)
      const prevKey = editing.original?.productId;
      const existing = discountByProduct[prevKey] || discountByProduct[payload.productId];
      if (pct && pct > 0) {
        if (existing) await api.discounts.update({ id: existing.id, productId: payload.productId, discountPercent: pct });
        else await api.discounts.create({ productId: payload.productId, discountPercent: pct });
      } else if (existing) {
        await api.discounts.remove(existing.id);
      }
    }, editing.original ? 'Produit mis à jour' : 'Produit ajouté');
    if (ok) setEditing(null);
  };

  const remove = async () => {
    const p = toDelete;
    const ok = await run(async () => {
      await api.products.remove(p.id);
      const d = discountByProduct[p.productId];
      if (d) await api.discounts.remove(d.id);
    }, 'Produit supprimé');
    if (ok) setToDelete(null);
  };

  const f = editing?.form;
  const set = (k) => (e) => setEditing((s) => ({ ...s, form: { ...s.form, [k]: e.target.value } }));
  const valid = f && f.name.trim() && f.productId.trim() && f.price !== '' && parseInt(f.price, 10) >= 0;
  const duplicate =
    f && products.data.some((p) => p.productId === f.productId.trim() && p.id !== editing.original?.id);

  return (
    <>
      <PageHead title="Produits" sub="Catalogue de l’inventaire et remises associées.">
        <Search value={q} onChange={setQ} placeholder="Nom, référence…" />
        <button className="btn primary" onClick={openNew}>
          + Nouveau produit
        </button>
      </PageHead>

      <div className="card flush">
        <StateBlock
          loading={products.loading && !products.data.length}
          error={products.error}
          onRetry={reloadAll}
          empty={!rows.length}
          emptyText={q ? 'Aucun produit ne correspond à la recherche.' : 'Le catalogue est vide.'}
          emptyAction={!q && <button className="btn primary sm" onClick={openNew}>Ajouter le premier produit</button>}
        />
        {!products.error && rows.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th>Qualité</th>
                <th className="num">Prix</th>
                <th className="num">Remise</th>
                <th className="num">Prix final</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const d = discountByProduct[p.productId];
                const final = d ? p.price * (1 - d.discountPercent / 100) : p.price;
                return (
                  <tr key={p.id}>
                    <td className="mono">{p.productId || '—'}</td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description && <div className="muted small clamp">{p.description}</div>}
                    </td>
                    <td>{p.quality ? <span className="badge b-neutral">{p.quality}</span> : '—'}</td>
                    <td className="num">{money(p.price)}</td>
                    <td className="num">{d ? <span className="badge b-green">−{d.discountPercent}%</span> : <span className="muted">—</span>}</td>
                    <td className="num">
                      <strong>{money(final)}</strong>
                    </td>
                    <td>
                      <RowActions onEdit={() => openEdit(p)} onDelete={() => setToDelete(p)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal
          title={editing.original ? `Modifier « ${editing.original.name} »` : 'Nouveau produit'}
          onClose={() => setEditing(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
              <button className="btn primary" disabled={!valid || duplicate || busy} onClick={save}>
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Référence *" hint={duplicate ? 'Cette référence existe déjà.' : 'Identifiant unique, ex. P-001'}>
              <input value={f.productId} onChange={set('productId')} autoFocus className={duplicate ? 'invalid' : ''} />
            </Field>
            <Field label="Nom *">
              <input value={f.name} onChange={set('name')} />
            </Field>
            <Field label="Description" wide>
              <textarea rows={3} value={f.description} onChange={set('description')} />
            </Field>
            <Field label="Qualité">
              <input value={f.quality} onChange={set('quality')} placeholder="ex. Premium" />
            </Field>
            <Field label="Prix (€) *" hint="Nombre entier">
              <input type="number" min="0" step="1" value={f.price} onChange={set('price')} />
            </Field>
            <Field label="Remise (%)" hint="Laisser vide pour aucune remise">
              <input type="number" min="0" max="100" step="1" value={f.discount} onChange={set('discount')} />
            </Field>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Confirm
          text={`Supprimer « ${toDelete.name} » (${toDelete.productId}) ainsi que sa remise éventuelle ?`}
          busy={busy}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
