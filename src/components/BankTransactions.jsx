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
      console.log('=== RÉCUPÉRATION DES TRANSACTIONS ===');
      console.log('Token utilisé:', token);
      
      // D'abord, récupérons les comptes disponibles via notre serveur
      const accountsResponse = await axios.get('http://localhost:5073/api/accounts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Comptes disponibles:', accountsResponse.data);
      
      if (!accountsResponse.data.results || accountsResponse.data.results.length === 0) {
        throw new Error('Aucun compte disponible');
      }
      
      // Récupérer les transactions pour chaque compte via notre serveur
      const allTransactions = [];
      for (const account of accountsResponse.data.results) {
        console.log(`Récupération des transactions pour le compte ${account.account_id}`);
        
        const transactionsResponse = await axios.get(
          `http://localhost:5073/api/accounts/${account.account_id}/transactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log(`Transactions reçues pour le compte ${account.account_id}:`, transactionsResponse.data);
        
        if (transactionsResponse.data.results) {
          allTransactions.push(...transactionsResponse.data.results);
        }
      }
      
      console.log('Toutes les transactions:', allTransactions);
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erreur détaillée lors de la récupération des transactions:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      let errorMessage = 'Erreur lors de la récupération des transactions';
      if (error.response?.data?.error) {
        errorMessage += `: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      setError(errorMessage);
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
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-gray-700">Description</th>
                <th className="px-4 py-2 text-right text-gray-700">Montant</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900">
                    {format(new Date(transaction.timestamp), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-4 py-2 text-gray-900">{transaction.description}</td>
                  <td className={`px-4 py-2 text-right ${
                    transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: transaction.currency || 'EUR'
                    }).format(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700">Aucune transaction à afficher</p>
      )}
    </div>
  );
};

export default BankTransactions;
