import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const TrueLayerCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        try {
          const response = await fetch('/api/bank/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la synchronisation bancaire');
          }

          const data = await response.json();
          // Rediriger vers le tableau de bord avec les données
          navigate('/', { state: { transactions: data.transactions } });
        } catch (error) {
          console.error('Erreur:', error);
          navigate('/', { state: { error: 'Échec de la synchronisation bancaire' } });
        }
      } else {
        navigate('/', { state: { error: 'Code d\'autorisation manquant' } });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Synchronisation en cours...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default TrueLayerCallback;
