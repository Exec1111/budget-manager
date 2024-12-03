import { useBudget } from '../context/BudgetContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BankTransactions from '../components/BankTransactions';

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
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Revenus mensuels</h3>
          <p className="text-2xl text-green-600">{monthlyIncome.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Dépenses mensuelles</h3>
          <p className="text-2xl text-red-600">{monthlyExpenses.toFixed(2)} €</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Balance mensuelle</h3>
          <p className={`text-2xl ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyBalance.toFixed(2)} €
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Évolution de la balance</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intégration du composant BankTransactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <BankTransactions />
      </div>
    </div>
  );
};

export default Dashboard;
