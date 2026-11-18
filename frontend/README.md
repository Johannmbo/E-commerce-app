# Frontend — Back-office E-commerce

Interface React (Vite) pour les microservices `customer-service`, `inventory-service`,
`order-service` et `billing-service`.

Pages : tableau de bord (chiffres clés, état des services), produits + remises,
clients, commandes (+ lignes), factures (+ lignes facturées).

## Lancer en développement

Prérequis : Node.js 18+ et les microservices démarrés (discovery 8761, config 9999,
puis customer 8082, inventory 8083, billing 8084, order 8085) avec PostgreSQL.

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173

Les services n'ont pas de configuration CORS : le serveur Vite sert de proxy
(`vite.config.js`). Chaque préfixe (`/customer-service`, `/inventory-service`, …)
est renvoyé vers le port du service correspondant.

Options (variables d'environnement) :

| Variable       | Effet                                                                 |
|----------------|-----------------------------------------------------------------------|
| `BACKEND_HOST` | Hôte des services (défaut `localhost`)                                |
| `GATEWAY_URL`  | Tout faire passer par la gateway, ex. `GATEWAY_URL=http://localhost:8086` |

## Docker

Le service `e-commerce-frontend` est déclaré dans `docker-compose.yml`
(nginx sur le port **3000**, qui relaie les appels vers les conteneurs des services).

## Limites connues du backend (contournées côté interface)

- La remise n'est pas liée au produit (`Product.discount` reste `null`) : l'interface
  rapproche remises et produits par leur référence `productId`.
- Les lignes de commande et les lignes facturées sont enregistrées sans lien vers
  leur commande / facture : elles sont affichées dans des onglets séparés.
- Relier ces entités via les endpoints `update…` provoque une récursion JSON infinie
  (relations bidirectionnelles sans `@JsonIgnore` / `@JsonManagedReference`), c'est
  pourquoi l'interface ne le fait pas.
- `GET /customer-service/findCustomer/{id}` renvoie toujours un corps vide.
