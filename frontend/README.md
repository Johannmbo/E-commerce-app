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

Ajouter ce service dans `docker-compose.yml` (nginx sur le port **3000**, qui relaie
les appels vers les conteneurs des services) :

```yaml
  e-commerce-frontend:
    build: ./frontend
    container_name: e-commerce-frontend
    ports:
      - '3000:80'
    depends_on:
      - e-commerce-customer-service
      - e-commerce-inventory-service
      - e-commerce-billing-service
      - e-commerce-order-service
```

## Liaisons entre les données

Elles reposent sur les correctifs backend de novembre 2026 :

- une remise est rattachée au produit qui porte la même référence (`productId`) ;
- une ligne de commande est rattachée à sa commande (`orderId`) ;
- une ligne facturée est rattachée à sa facture (`bill.id`) ;
- supprimer une commande ou une facture supprime aussi ses lignes.
