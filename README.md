# E-commerce App - microservices Spring Boot


## Services

| Service             | Port | Rôle                                               | Tables                     |
|---------------------|------|----------------------------------------------------|----------------------------|
| `discovery-service` | 8761 | Annuaire Eureka (tableau de bord : http://localhost:8761) | —                   |
| `config-service`    | 9999 | Spring Cloud Config Server (backend Git)           | —                          |
| `customer-service`  | 8082 | Clients                                            | `customers`                |
| `inventory-service` | 8083 | Produits et remises                                | `products`, `discount`     |
| `billing-service`   | 8084 | Factures et lignes facturées                       | `bills`, `product_items`   |
| `order-service`     | 8085 | Commandes et lignes de commande                    | `orders`, `order_items`    |
| `gateway-service`   | 8086 | Spring Cloud Gateway (routes découvertes via Eureka) | —                        |
| `frontend`          | 5173 / 3000 | Back-office React                           | —                          |

## Démarrage avec Docker Compose

Les `Dockerfile` des services copient le JAR déjà compilé (`target/*.jar`) : il faut
donc **compiler avant** de construire les images.

```bash
# 1. Compiler chaque service (Windows : mvnw.cmd)
for s in discovery-service config-service customer-service inventory-service order-service billing-service; do
  (cd $s && ./mvnw -DskipTests package)
done

# 2. Construire et lancer
docker compose up --build
```

Ordre de démarrage géré par les `healthcheck` / `depends_on` :
PostgreSQL et Eureka → config-service → services métier → frontend.e

Ensuite :

- Back-office : http://localhost:3000
- Eureka : http://localhost:8761

> Dans le dépôt de configuration, la datasource pointe vers
> `jdbc:postgresql://postgres_db:5432/ecommerce_app` (utilisateur `postgres`,
> mot de passe `1234`), ce qui correspond au conteneur `postgres_db`.

## Démarrage en local (sans Docker)

1. **PostgreSQL** : créer la base `ecommerce_app` (utilisateur `postgres` / `1234`).
   Comme la configuration utilise l’hôte `postgres_db`, ajouter dans le fichier
   `hosts` (Windows : `C:\Windows\System32\drivers\etc\hosts`) :

   ```
   127.0.0.1 postgres_db
   ```

2. **Lancer les services dans cet ordre**, chacun dans son terminal :

   ```bash
   cd discovery-service && ./mvnw spring-boot:run   # attendre http://localhost:8761
   cd config-service    && ./mvnw spring-boot:run   # attendre http://localhost:9999/actuator/health
   cd customer-service  && ./mvnw spring-boot:run
   cd inventory-service && ./mvnw spring-boot:run
   cd order-service     && ./mvnw spring-boot:run
   cd billing-service   && ./mvnw spring-boot:run
   ```

3. **Frontend** :

   ```bash
   cd frontend
   npm install
   npm run dev        # http://localhost:5173
   ```

4. Vérification rapide :

   ```bash
   curl http://localhost:9999/inventory-service/default   # config servie
   curl http://localhost:8083/inventory-service/listProducts
   ```

## Configuration

| Variable d’environnement | Défaut                          | Utilisée par              |
|--------------------------|---------------------------------|---------------------------|
| `CONFIG_SERVICE_URL`     | `http://localhost:9999`         | services métier           |
| `DISCOVERY_SERVICE_URL`  | `http://localhost:8761/eureka`  | config-service, services  |

La configuration partagée (datasource, JPA, Eureka, actuator) vit dans
[`git-config-repo`](https://github.com/Johannmbo/git-config-repo) :
`application.properties` (commun) et `<nom-du-service>.properties`.
`customer-service` a aussi des profils `dev` et `prod` (`customer.params.*`),
consultables via `GET /testConfig1` et `GET /testConfig2`.

Tous les services exposent les endpoints Actuator (`/actuator/health`, …).

## API REST

Chaque contrôleur est préfixé par le nom de son service. Les corps sont en JSON.

### customer-service — `:8082/customer-service`

| Méthode | Chemin                  | Corps / description                         |
|---------|-------------------------|---------------------------------------------|
| POST    | `/addCustomer`          | `{ "name", "email", "address" }`            |
| GET     | `/listCustomers`        | Liste des clients                           |
| GET     | `/findCustomer/{id}`    | Un client, ou `404`                         |
| PUT     | `/updateCustomer`       | Client complet avec `id`                    |
| DELETE  | `/deleteCustomer/{id}`  |                                             |

### inventory-service — `:8083/inventory-service`

| Méthode | Chemin                    | Corps / description                                   |
|---------|---------------------------|-------------------------------------------------------|
| POST    | `/addProduct`             | `{ "productId", "name", "description", "quality", "price" }` |
| GET     | `/listProducts`           | Produits, avec leur `discount` éventuelle             |
| PUT     | `/updateProduct`          | Produit complet avec `id`                             |
| DELETE  | `/deleteProduct/{id}`     |                                                       |
| DELETE  | `/deleteAllProducts`      |                                                       |
| POST    | `/addDiscount`            | `{ "productId", "discountPercentage" }` (entier)      |
| GET     | `/listDiscounts`          |                                                       |
| PUT     | `/updateDiscount`         | `{ "id", "productId", "discountPercent" }`            |
| DELETE  | `/deleteDiscount/{id}`    | Détache la remise du produit puis la supprime         |

Une remise est rattachée automatiquement au(x) produit(s) ayant la même
référence `productId` (`products.discount_id`).

### order-service — `:8085/order-service`

| Méthode | Chemin                    | Corps / description                                    |
|---------|---------------------------|--------------------------------------------------------|
| POST    | `/addOrder`               | `{ "orderDate", "orderStatus", "orderType" }`          |
| GET     | `/listOrders`             | Commandes avec leurs lignes (`orderItem`)              |
| PUT     | `/updateOrders`           | Commande complète avec `id`                            |
| DELETE  | `/deleteOrder/{id}`       | Supprime aussi les lignes                              |
| POST    | `/addOrderItem`           | `{ "orderId", "quantity" }` — `404` si commande inconnue |
| GET     | `/listOrderItems`         | Lignes avec leur commande (`order`)                    |
| PUT     | `/updateOrderItems`       | `{ "id", "quantity", "order": { "id" } }`              |
| DELETE  | `/deleteOrderItem/{id}`   |                                                        |

### billing-service — `:8084/billing-service`

| Méthode | Chemin                      | Corps / description                                         |
|---------|-----------------------------|-------------------------------------------------------------|
| POST    | `/addBill`                  | `{ "billingDate", "customerId" }`                           |
| GET     | `/listBills`                | Factures avec leurs lignes (`productItems`)                 |
| PUT     | `/updateBill`               | Facture complète avec `id`                                  |
| DELETE  | `/deleteBill/{id}`          | Supprime aussi les lignes                                   |
| POST    | `/addProductItem`           | `{ "productId", "productName", "price", "quantity", "bill": { "id" } }` |
| GET     | `/listProductItems`         | Lignes avec leur facture (`bill`)                           |
| PUT     | `/updateProductItem`        | Ligne complète avec `id`                                    |
| DELETE  | `/deleteProductItem/{id}`   |                                                             |

Exemple :

```bash
curl -X POST http://localhost:8083/inventory-service/addProduct \
     -H "Content-Type: application/json" \
     -d '{"productId":"P-001","name":"Laptop","description":"16 Go","quality":"Premium","price":1200}'
```

### Via la gateway (optionnel)

`gateway-service` crée une route par service enregistré dans Eureka
(`/<service-id>/**`, préfixe retiré). Comme les contrôleurs sont eux-mêmes
préfixés, l’URL contient deux fois le nom du service :

```
http://localhost:8086/inventory-service/inventory-service/listProducts
```

## Frontend

Back-office React (Vite) dans [`frontend/`](frontend/README.md) :

- **Tableau de bord** : chiffres clés, montant facturé, commandes par statut,
  état des 4 services ;
- **Produits** : catalogue, remises, prix remisé ;
- **Clients** ;
- **Commandes** : changement de statut depuis la liste, lignes par commande ;
- **Factures** : client, nombre de lignes, total, lignes facturées.

```bash
cd frontend && npm install && npm run dev
```

Options : `BACKEND_HOST` (hôte des services) et `GATEWAY_URL`
(ex. `http://localhost:8086`) pour passer par la gateway. Détails dans
[`frontend/README.md`](frontend/README.md).
