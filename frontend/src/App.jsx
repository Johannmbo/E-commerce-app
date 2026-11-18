import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Customers from './pages/Customers.jsx';
import Orders from './pages/Orders.jsx';
import Bills from './pages/Bills.jsx';

const PAGES = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z', C: Dashboard },
  { id: 'products', label: 'Produits', icon: 'M20 7 12 3 4 7v10l8 4 8-4zM4 7l8 4 8-4M12 11v10', C: Products },
  { id: 'customers', label: 'Clients', icon: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm13 9v-1a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8', C: Customers },
  { id: 'orders', label: 'Commandes', icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0', C: Orders },
  { id: 'bills', label: 'Factures', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5', C: Bills },
];

const fromHash = () => {
  const h = window.location.hash.replace('#/', '');
  return PAGES.some((p) => p.id === h) ? h : 'dashboard';
};

export default function App() {
  const [page, setPage] = useState(fromHash);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setPage(fromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = (id) => {
    window.location.hash = `/${id}`;
    setMenu(false);
  };
  const Current = PAGES.find((p) => p.id === page).C;

  return (
    <div className="shell">
      <aside className={`sidebar${menu ? ' open' : ''}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <svg viewBox="0 0 32 32" width="26" height="26">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M9 11h14l-1.5 9h-11z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="12.5" cy="23.5" r="1.6" fill="#fff" />
              <circle cx="19.5" cy="23.5" r="1.6" fill="#fff" />
            </svg>
          </span>
          <div>
            <strong>E-commerce</strong>
            <span>Back-office</span>
          </div>
        </div>
        <nav>
          {PAGES.map((p) => (
            <button key={p.id} className={`nav-item${p.id === page ? ' active' : ''}`} onClick={() => go(p.id)}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={p.icon} />
              </svg>
              {p.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot muted small">Microservices Spring Boot · Eureka</div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            ☰
          </button>
          <span className="topbar-title">{PAGES.find((p) => p.id === page).label}</span>
        </div>
        <main className="content">
          <Current go={go} />
        </main>
      </div>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
    </div>
  );
}
