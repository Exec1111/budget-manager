import { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import Modal from '../components/Modal';
import { RiAddLine, RiMoneyDollarCircleLine, RiHistoryLine } from 'react-icons/ri';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OPERATION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  MONTHLY: 'monthly'
};

const Savings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [balance, setBalance] = useState('');
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [operationAmount, setOperationAmount] = useState('');
  const [operationType, setOperationType] = useState('deposit');
  const [operationDate, setOperationDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { savings, addSaving, updateSaving, addOperation, getOperationHistory, budgetElements } = useBudget();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    addSaving({
      label,
      balance: parseFloat(balance) || 0,
    });
    
    setLabel('');
    setBalance('');
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLabel('');
    setBalance('');
  };

  const handleOperation = (saving) => {
    setSelectedSaving(saving);
    setIsOperationModalOpen(true);
  };

  const handleHistory = (saving) => {
    setSelectedSaving(saving);
    setIsHistoryModalOpen(true);
  };

  const getChartData = (saving) => {
    const operations = getOperationHistory(saving.id);
    const sortedOperations = [...operations].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    return {
      labels: sortedOperations.map(op => 
        new Date(op.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Balance',
          data: sortedOperations.map(op => op.balanceAfter),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9CA3AF'
        }
      },
      title: {
        display: true,
        text: 'Balance History',
        color: '#9CA3AF'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 192, 192, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value) => `${value.toFixed(2)} €`
        }
      },
      x: {
        grid: {
          color: 'rgba(75, 192, 192, 0.1)'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const getBalanceTrend = (saving) => {
    const operations = getOperationHistory(saving.id);
    if (operations.length < 2) return null;
    
    const sortedOperations = [...operations].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const lastBalance = sortedOperations[sortedOperations.length - 1].balanceAfter;
    const previousBalance = sortedOperations[sortedOperations.length - 2].balanceAfter;
    
    return {
      isPositive: lastBalance > previousBalance,
      percentage: Math.abs(((lastBalance - previousBalance) / previousBalance) * 100).toFixed(1)
    };
  };

  const getLinkedBudgetElements = (savingId) => {
    return budgetElements.filter(element => element.savingsId === savingId);
  };

  const getFirstDayOfCurrentMonth = () => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };

  const OperationModal = ({ isOpen, onClose, saving }) => {
    const [operationType, setOperationType] = useState(OPERATION_TYPES.DEPOSIT);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(getFirstDayOfCurrentMonth());
    const linkedElement = getLinkedBudgetElements(saving.id)[0];
    const hasLinkedElement = !!linkedElement;

    useEffect(() => {
      if (operationType === OPERATION_TYPES.MONTHLY && hasLinkedElement) {
        setAmount(linkedElement.monthlyValue.toString());
        setDate(getFirstDayOfCurrentMonth());
      } else {
        setAmount('');
      }
    }, [operationType, linkedElement]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        console.log('Submitting operation:', {
          type: operationType,
          amount: parseFloat(amount),
          date: date,
          budgetElementId: operationType === OPERATION_TYPES.MONTHLY ? linkedElement.id : null
        });

        const operation = {
          type: operationType,
          amount: parseFloat(amount),
          date: new Date(date),
          budgetElementId: operationType === OPERATION_TYPES.MONTHLY ? linkedElement.id : null
        };

        await addOperation(saving.id, operation);
        console.log('Operation submitted successfully');
        onClose();
      } catch (error) {
        console.error('Error submitting operation:', error);
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <h2 className="text-2xl font-bold mb-4">Nouvelle opération</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Type d'opération</label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              className="input-field w-full"
              required
            >
              <option value={OPERATION_TYPES.DEPOSIT}>Dépôt</option>
              <option value={OPERATION_TYPES.WITHDRAWAL}>Retrait</option>
              {hasLinkedElement && (
                <option value={OPERATION_TYPES.MONTHLY}>Mensuel</option>
              )}
            </select>
          </div>

          {operationType === OPERATION_TYPES.MONTHLY && hasLinkedElement && (
            <div>
              <label className="block mb-1">Élément budgétaire</label>
              <div className="input-field w-full bg-gray-700">
                {linkedElement.label} ({linkedElement.monthlyValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1">Montant</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                if (operationType !== OPERATION_TYPES.MONTHLY) {
                  setAmount(e.target.value);
                }
              }}
              className={`input-field w-full ${operationType === OPERATION_TYPES.MONTHLY ? 'bg-gray-700' : ''}`}
              required
              step="0.01"
              min="0"
              readOnly={operationType === OPERATION_TYPES.MONTHLY}
            />
          </div>

          <div>
            <label className="block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Modal>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Épargnes</h1>
        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <RiAddLine className="text-xl" />
          <span>Nouvelle épargne</span>
        </button>
      </div>

      {/* Liste des épargnes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savings.map((saving) => {
          const linkedElements = getLinkedBudgetElements(saving.id);
          return (
            <div key={saving.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{saving.label}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-text-secondary">
                      Balance: {saving.balance.toFixed(2)} €
                    </p>
                    {getBalanceTrend(saving) && (
                      <span className={`text-sm ${
                        getBalanceTrend(saving).isPositive 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        ({getBalanceTrend(saving).isPositive ? '+' : '-'}
                        {getBalanceTrend(saving).percentage}%)
                      </span>
                    )}
                    
                    {/* Affichage des éléments budgétaires liés */}
                    {linkedElements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Linked Budget Elements:</h4>
                        <div className="space-y-2">
                          {linkedElements.map(element => (
                            <div key={element.id} className="flex items-center space-x-2 text-sm">
                              <span className={element.type === 'monthly' ? 'text-blue-400' : 
                                            element.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                                {element.type === 'monthly' ? '📅' : 
                                 element.type === 'credit' ? '↗️' : '↘️'}
                              </span>
                              <span>{element.label}</span>
                              <span className={element.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                                {element.monthlyValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOperation(saving)}
                    className="btn-secondary"
                  >
                    <RiMoneyDollarCircleLine className="text-xl" />
                    <span>Opération</span>
                  </button>
                  <button
                    onClick={() => handleHistory(saving)}
                    className="btn-secondary"
                  >
                    <RiHistoryLine className="text-xl" />
                    <span>Historique</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Épargne */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nouvelle épargne"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Libellé
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Solde initial (€)
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="input-field w-full"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>

      {isOperationModalOpen && (
        <OperationModal
          isOpen={isOperationModalOpen}
          onClose={() => setIsOperationModalOpen(false)}
          saving={selectedSaving}
        />
      )}

      {/* Modal Historique */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Historique - ${selectedSaving?.label}`}
      >
        <div className="space-y-6">
          <div className="h-64">
            {selectedSaving && (
              <Line 
                data={getChartData(selectedSaving)} 
                options={chartOptions}
              />
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Operations History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedSaving && [...getOperationHistory(selectedSaving.id)]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((operation) => (
                <div 
                  key={operation.id}
                  className="flex justify-between items-center p-3 bg-dark-surface-2 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {operation.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {new Date(operation.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      operation.type === 'deposit' 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {operation.type === 'deposit' ? '+' : '-'}
                      {operation.amount.toFixed(2)} €
                    </p>
                    <p className="text-sm text-text-secondary">
                      Solde: {operation.balanceAfter.toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Savings;
