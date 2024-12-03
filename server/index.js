require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging des variables d'environnement au démarrage (sans les secrets)
console.log('Configuration serveur:', {
  port: PORT,
  clientId: process.env.TRUELAYER_CLIENT_ID,
  redirectUri: process.env.TRUELAYER_REDIRECT_URI
});

app.use(cors());
app.use(express.json());

// Route pour gérer le callback initial de TrueLayer (GET)
app.get('/callback', async (req, res) => {
  try {
    const { code, scope } = req.query;
    console.log('Réception callback TrueLayer (GET)');
    console.log('Query params:', req.query);
    
    if (!code) {
      console.error('Code manquant dans les paramètres');
      return res.status(400).json({ error: 'Code manquant dans les paramètres' });
    }

    console.log('Code d\'autorisation reçu:', code);
    console.log('Scope reçu:', scope);
    
    console.log('=== DEBUG TOKEN EXCHANGE ===');
    console.log('Variables d\'environnement:');
    console.log('TRUELAYER_CLIENT_ID:', process.env.TRUELAYER_CLIENT_ID);
    console.log('TRUELAYER_REDIRECT_URI:', process.env.TRUELAYER_REDIRECT_URI);
    console.log('Client secret length:', process.env.TRUELAYER_CLIENT_SECRET?.length || 0);

    // Préparation des données au format x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.TRUELAYER_CLIENT_ID);
    params.append('client_secret', process.env.TRUELAYER_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', process.env.TRUELAYER_REDIRECT_URI);

    console.log('URL de requête:', 'https://auth.truelayer-sandbox.com/connect/token');
    console.log('Paramètres encodés:', params.toString());

    try {
      console.log('Tentative d\'échange du code contre un token...');
      const tokenResponse = await axios.post(
        'https://auth.truelayer-sandbox.com/connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        }
      );

      console.log('Réponse token brute:', tokenResponse.data);
      const { access_token } = tokenResponse.data;

      if (!access_token) {
        console.error('Token d\'accès manquant dans la réponse');
        return res.status(500).json({ error: 'Token d\'accès manquant dans la réponse' });
      }

      console.log('Token reçu avec succès');
      res.redirect(`http://localhost:5173?token=${access_token}`);
    } catch (error) {
      console.error('Erreur lors de l\'échange du token:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      
      res.status(500).json({ 
        error: 'Erreur lors de l\'échange du token',
        details: error.response?.data || error.message,
        status: error.response?.status
      });
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      message: error.message
    });
  }
});

// Route pour gérer le callback de TrueLayer (POST)
app.post('/api/bank/callback', async (req, res) => {
  console.log('Réception callback TrueLayer (POST)');
  console.log('Body reçu:', req.body);
  
  try {
    const { code } = req.body;
    console.log('Code d\'autorisation reçu:', code);
    
    console.log('Tentative d\'échange du code contre un token...');
    console.log('=== DEBUG TOKEN EXCHANGE ===');
    console.log('Code d\'autorisation reçu:', code);
    console.log('Variables d\'environnement:');
    console.log('TRUELAYER_CLIENT_ID:', process.env.TRUELAYER_CLIENT_ID);
    console.log('TRUELAYER_REDIRECT_URI:', process.env.TRUELAYER_REDIRECT_URI);
    console.log('Client secret length:', process.env.TRUELAYER_CLIENT_SECRET?.length || 0);

    // Préparation des données au format x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.TRUELAYER_CLIENT_ID);
    params.append('client_secret', process.env.TRUELAYER_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', process.env.TRUELAYER_REDIRECT_URI);

    console.log('URL de requête:', 'https://auth.truelayer-sandbox.com/connect/token');
    console.log('Paramètres encodés:', params.toString());

    try {
      // Échange du code contre un token d'accès
      const tokenResponse = await axios.post(
        'https://auth.truelayer-sandbox.com/connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          auth: {
            username: process.env.TRUELAYER_CLIENT_ID,
            password: process.env.TRUELAYER_CLIENT_SECRET
          }
        }
      );

      console.log('Token reçu avec succès');
      const { access_token } = tokenResponse.data;

      console.log('Récupération des transactions...');
      // Récupération des transactions
      const transactionsResponse = await axios.get(
        'https://api.truelayer-sandbox.com/data/v1/transactions',
        {
          headers: { Authorization: `Bearer ${access_token}` }
        }
      );

      console.log('Transactions récupérées avec succès');
      res.json({ transactions: transactionsResponse.data.results });
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  } catch (error) {
    console.error('Erreur détaillée:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des transactions',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
