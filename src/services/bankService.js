const handleTrueLayerCallback = async (code) => {
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

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

const getTransactions = async () => {
  try {
    const response = await fetch('/api/bank/transactions');
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des transactions');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const bankService = {
  handleTrueLayerCallback,
  getTransactions,
};
