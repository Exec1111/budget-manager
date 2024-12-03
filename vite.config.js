import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement basées sur le mode (development, production)
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Variables d\'environnement chargées:', {
    VITE_TRUELAYER_CLIENT_ID: env.VITE_TRUELAYER_CLIENT_ID
  })

  return {
    plugins: [react()],
    // Expose explicitement les variables d'environnement
    define: {
      'import.meta.env.VITE_TRUELAYER_CLIENT_ID': JSON.stringify(env.VITE_TRUELAYER_CLIENT_ID)
    }
  }
})
