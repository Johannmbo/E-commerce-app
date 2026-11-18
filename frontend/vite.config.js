import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Les microservices n'ont pas de configuration CORS : le serveur de dev Vite
// sert donc de proxy. Chaque préfixe correspond au @RequestMapping du service.
//
// Deux modes :
//  - direct (par défaut) : chaque préfixe va vers le port du service
//  - gateway : définir GATEWAY_URL=http://localhost:8086 pour tout faire passer
//    par gateway-service (routes Eureka /<service-id>/**).
const SERVICES = {
  'customer-service': 8082,
  'inventory-service': 8083,
  'billing-service': 8084,
  'order-service': 8085,
};

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  const host = env.BACKEND_HOST || 'localhost';
  const gateway = env.GATEWAY_URL;

  const proxy = {};
  for (const [name, port] of Object.entries(SERVICES)) {
    proxy[`/${name}`] = gateway
      ? { target: gateway, changeOrigin: true, rewrite: (p) => `/${name}${p}` }
      : { target: `http://${host}:${port}`, changeOrigin: true };
  }

  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  };
});
