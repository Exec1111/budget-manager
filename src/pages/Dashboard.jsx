import { useBudget } from '../context/BudgetContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { calculateMonthlyIncome, calculateMonthlyExpenses, budgetElements } = useBudget();

  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Simuler des données pour le graphique (à remplacer par des données réelles)
  const data = [
    { name: 'Jan', balance: 1000 },
    { name: 'Fév', balance: 1500 },
    { name: 'Mar', balance: 2000 },
    { name: 'Avr', balance: 1800 },
    { name: 'Mai', balance: 2500 },
    { name: 'Juin', balance: 3000 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-flup-orange">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte des revenus */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Revenus mensuels</h2>
          <p className="text-2xl font-bold text-custom-fuchsia">
            {monthlyIncome.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        {/* Carte des dépenses */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Dépenses mensuelles</h2>
          <p className="text-2xl font-bold text-flup-orange">
            {monthlyExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        {/* Carte du solde */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Solde mensuel</h2>
          <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {monthlyBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>

      {/* Graphique d'évolution */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Évolution du patrimoine</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#2D2D2D',
                  border: 'none',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#FF36AB"
                strokeWidth={2}
                dot={{ fill: '#FF36AB' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
