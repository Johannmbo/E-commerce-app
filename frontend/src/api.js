// Client HTTP pour les 4 microservices. Les chemins reprennent exactement
// les @RequestMapping des contrôleurs Spring (proxy Vite / nginx devant).

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text || `${res.status} ${res.statusText}`;
    if (res.status === 502 || res.status === 503 || res.status === 504 || /ECONNREFUSED/.test(text)) {
      msg = 'Service injoignable. Vérifiez qu’il est démarré.';
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

const get = (u) => request('GET', u);
const post = (u, b) => request('POST', u, b);
const put = (u, b) => request('PUT', u, b);
const del = (u) => request('DELETE', u);

const C = '/customer-service';
const I = '/inventory-service';
const O = '/order-service';
const B = '/billing-service';

export const api = {
  customers: {
    list: () => get(`${C}/listCustomers`),
    create: (c) => post(`${C}/addCustomer`, c),
    update: (c) => put(`${C}/updateCustomer`, c),
    remove: (id) => del(`${C}/deleteCustomer/${id}`),
  },
  products: {
    list: () => get(`${I}/listProducts`),
    create: (p) => post(`${I}/addProduct`, p),
    update: (p) => put(`${I}/updateProduct`, p),
    remove: (id) => del(`${I}/deleteProduct/${id}`),
  },
  discounts: {
    list: () => get(`${I}/listDiscounts`),
    // le DTO de création attend "discountPercentage", l'entité "discountPercent"
    create: ({ productId, discountPercent }) =>
      post(`${I}/addDiscount`, { productId, discountPercentage: discountPercent }),
    update: (d) => put(`${I}/updateDiscount`, d),
    remove: (id) => del(`${I}/deleteDiscount/${id}`),
  },
  orders: {
    list: () => get(`${O}/listOrders`),
    create: (o) => post(`${O}/addOrder`, o),
    update: (o) => put(`${O}/updateOrders`, o),
    remove: (id) => del(`${O}/deleteOrder/${id}`),
  },
  orderItems: {
    list: () => get(`${O}/listOrderItems`),
    create: (i) => post(`${O}/addOrderItem`, i),
    update: (i) => put(`${O}/updateOrderItems`, i),
    remove: (id) => del(`${O}/deleteOrderItem/${id}`),
  },
  bills: {
    list: () => get(`${B}/listBills`),
    create: (b) => post(`${B}/addBill`, b),
    update: (b) => put(`${B}/updateBill`, b),
    remove: (id) => del(`${B}/deleteBill/${id}`),
  },
  productItems: {
    list: () => get(`${B}/listProductItems`),
    create: (i) => post(`${B}/addProductItem`, i),
    update: (i) => put(`${B}/updateProductItem`, i),
    remove: (id) => del(`${B}/deleteProductItem/${id}`),
  },
  health: async (prefix) => {
    try {
      const r = await fetch(`${prefix}/${{ [C]: 'listCustomers', [I]: 'listProducts', [O]: 'listOrders', [B]: 'listBills' }[prefix]}`);
      return r.ok;
    } catch {
      return false;
    }
  },
};

export const SERVICES = [
  { key: C, label: 'Clients', port: 8082 },
  { key: I, label: 'Inventaire', port: 8083 },
  { key: B, label: 'Facturation', port: 8084 },
  { key: O, label: 'Commandes', port: 8085 },
];

// ---- utilitaires de format ----
export const money = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n || 0);

export const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? '—' : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const toInputDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt) ? '' : dt.toISOString().slice(0, 10);
};

export const today = () => new Date().toISOString().slice(0, 10);
