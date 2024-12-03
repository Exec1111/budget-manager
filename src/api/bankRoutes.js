const express = require('express');
const router = express.Router();
const axios = require('axios');

const TRUELAYER_AUTH_URL = 'https://auth.truelayer-sandbox.com';
const TRUELAYER_API_URL = 'https://api.truelayer-sandbox.com';

router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;

    // Échanger le code contre un token
    const tokenResponse = await axios.post(`${TRUELAYER_AUTH_URL}/connect/token`, {
      grant_type: 'authorization_code',
      client_id: process.env.TRUELAYER_CLIENT_ID,
      client_secret: process.env.TRUELAYER_CLIENT_SECRET,
      code,
      redirect_uri: process.env.TRUELAYER_REDIRECT_URI
    });

    const { access_token } = tokenResponse.data;

    // Récupérer les comptes
    const accountsResponse = await axios.get(`${TRUELAYER_API_URL}/data/v1/accounts`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const accounts = accountsResponse.data.results;

    // Récupérer les transactions pour chaque compte
    const transactionsPromises = accounts.map(account =>
      axios.get(`${TRUELAYER_API_URL}/data/v1/accounts/${account.account_id}/transactions`, {
        headers: { Authorization: `Bearer ${access_token}` }
      })
    );

    const transactionsResponses = await Promise.all(transactionsPromises);
    const transactions = transactionsResponses.flatMap(response => response.data.results);

    // Ici, vous pouvez sauvegarder les transactions dans votre base de données
    // Pour l'exemple, nous les renvoyons simplement
    res.json({ transactions });
  } catch (error) {
    console.error('Erreur TrueLayer:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erreur lors de la synchronisation bancaire' });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    // Ici, vous devriez récupérer les transactions depuis votre base de données
    // Pour l'exemple, nous renvoyons des données fictives
    const transactions = [
      {
        timestamp: new Date(),
        description: "Test de transaction",
        amount: -50.00
      }
    ];
    res.json(transactions);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
});

module.exports = router;
