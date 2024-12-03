import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BankTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Récupérer le token des paramètres d'URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      console.log('Token trouvé, récupération des transactions...');
      fetchTransactions(token);
    }
  }, []);

  const fetchTransactions = async (token) => {
    try {
      console.log('Appel API transactions avec le token');
      const response = await axios.get('https://api.truelayer-sandbox.com/data/v1/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Transactions reçues:', response.data);
      setTransactions(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      setError('Erreur lors de la récupération des transactions');
    }
  };

  const handleBankSync = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const clientId = import.meta.env.VITE_TRUELAYER_CLIENT_ID;
      console.log('=== DEBUG TRUELAYER ===');
      console.log('Client ID:', clientId);
      console.log('Environment variables:', import.meta.env);
      
      const redirectUri = 'http://localhost:5073/callback';
      // Scope pour TrueLayer
      const scope = 'info accounts balance cards transactions direct_debits standing_orders offline_access';
      
      // Construire l'URL d'authentification
      const authUrl = new URL('https://auth.truelayer-sandbox.com/');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('providers', 'uk-cs-mock uk-ob-all uk-oauth-all');

      console.log('=== URL DETAILS ===');
      console.log('Base URL:', authUrl.origin + authUrl.pathname);
      console.log('Paramètres:');
      for (const [key, value] of authUrl.searchParams.entries()) {
        console.log(`${key}: ${value}`);
      }
      console.log('URL complète:', authUrl.toString());

      // Rediriger vers TrueLayer
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setError('Erreur lors de la synchronisation avec la banque');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transactions Bancaires</h2>
      <button
        onClick={handleBankSync}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
      >
        {isLoading ? 'Synchronisation...' : 'Synchroniser avec la banque'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Montant</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{format(new Date(transaction.timestamp), 'dd MMMM yyyy', { locale: fr })}</td>
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className="px-4 py-2">{formatAmount(transaction.amount)} {transaction.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Aucune transaction à afficher</p>
      )}
    </div>
  );
};

export default BankTransactions;
