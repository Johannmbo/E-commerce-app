import { useEffect, useMemo, useState } from 'react';
import { api, SERVICES, money, fmtDate } from '../api.js';
import { PageHead, useList } from '../components/ui.jsx';

export default function Dashboard({ go }) {
  const products = useList(api.products.list);
  const customers = useList(api.customers.list);
  const orders = useList(api.orders.list);
  const bills = useList(api.bills.list);
  const lines = useList(api.productItems.list);
  const [health, setHealth] = useState({});

  const checkHealth = async () => {
    const entries = await Promise.all(SERVICES.map(async (s) => [s.key, await api.health(s.key)]));
    setHealth(Object.fromEntries(entries));
  };
  useEffect(() => {
    checkHealth();
  }, []);

  const revenue = useMemo(() => lines.data.reduce((s, l) => s + (l.price || 0) * (l.quantity || 0), 0), [lines.data]);

  const statusCounts = useMemo(() => {
    const m = {};
    for (const o of orders.data) {
      const k = o.orderStatus || 'Sans statut';
      m[k] = (m[k] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [orders.data]);

  const recentOrders = [...orders.data].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
  const maxStatus = Math.max(1, ...statusCounts.map(([, n]) => n));

  const kpis = [
    { label: 'Produits', value: products.data.length, page: 'products', l: products },
    { label: 'Clients', value: customers.data.length, page: 'customers', l: customers },
    { label: 'Commandes', value: orders.data.length, page: 'orders', l: orders },
    { label: 'Factures', value: bills.data.length, page: 'bills', l: bills },
  ];

  return (
    <>
      <PageHead title="Tableau de bord" sub="Vue d’ensemble de la boutique et de l’état des services.">
        <button
          className="btn ghost"
          onClick={() => {
            [products, customers, orders, bills, lines].forEach((x) => x.reload());
            checkHealth();
          }}
        >
          Actualiser
        </button>
      </PageHead>

      <section className="kpis">
        {kpis.map((k) => (
          <button key={k.label} className="kpi" onClick={() => go(k.page)}>
            <span className="kpi-label">{k.label}</span>
            <span className="kpi-value">{k.l.loading ? '…' : k.l.error ? '—' : k.value}</span>
          </button>
        ))}
        <div className="kpi kpi-accent">
          <span className="kpi-label">Montant facturé</span>
          <span className="kpi-value">{lines.loading ? '…' : lines.error ? '—' : money(revenue)}</span>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <h3>Dernières commandes</h3>
          {recentOrders.length === 0 ? (
            <p className="muted small">{orders.error ? 'Service commandes injoignable.' : 'Aucune commande pour le moment.'}</p>
          ) : (
            <table className="table compact">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">#{o.id}</td>
                    <td>{fmtDate(o.orderDate)}</td>
                    <td>{o.orderType || '—'}</td>
                    <td>
                      <span className={`badge ${statusClass(o.orderStatus)}`}>{o.orderStatus || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Commandes par statut</h3>
          {statusCounts.length === 0 ? (
            <p className="muted small">Pas encore de données.</p>
          ) : (
            <ul className="bars">
              {statusCounts.map(([k, n]) => (
                <li key={k}>
                  <span className="bar-label">{k}</span>
                  <span className="bar-track">
                    <span className="bar-fill" style={{ width: `${(n / maxStatus) * 100}%` }} />
                  </span>
                  <span className="bar-value">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <h3>État des microservices</h3>
        <div className="services">
          {SERVICES.map((s) => (
            <div key={s.key} className="service">
              <span className={`dot ${health[s.key] === undefined ? '' : health[s.key] ? 'up' : 'down'}`} />
              <div>
                <strong>{s.label}</strong>
                <span className="muted small mono">
                  {s.key.slice(1)} · :{s.port}
                </span>
              </div>
              <span className="muted small push">
                {health[s.key] === undefined ? 'vérification…' : health[s.key] ? 'en ligne' : 'hors ligne'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function statusClass(s = '') {
  const v = s.toLowerCase();
  if (/(livr|deliver|termin|done|pay)/.test(v)) return 'b-green';
  if (/(annul|cancel|refus)/.test(v)) return 'b-red';
  if (/(cours|progress|exp|ship|prépar|prep)/.test(v)) return 'b-amber';
  return 'b-blue';
}
