import { useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { TRANSACTION_TYPES } from '../types';
import { useNavigate } from 'react-router-dom';

const BudgetElements = () => {
  console.log('Rendu du composant BudgetElements');
  
  const navigate = useNavigate();
  const { 
    budgetElements,
    holders,
    deleteBudgetElement
  } = useBudget();

  useEffect(() => {
    console.log('BudgetElements monté');
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await deleteBudgetElement(id);
      } catch (error) {
        console.error('Erreur lors de la suppression :', error);
        alert('Une erreur est survenue lors de la suppression');
      }
    }
  };

  const getHolderName = (holderId) => {
    const holder = holders.find(h => h.id === holderId);
    return holder ? `${holder.firstName} ${holder.lastName}` : 'Titulaire inconnu';
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    console.log('Clic sur le bouton Ajouter');
    navigate('/budget-elements/new');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-flup-orange">Éléments budgétaires</h1>
        <button
          type="button"
          onClick={handleAddClick}
          className="bg-flup-orange hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-all cursor-pointer"
        >
          Ajouter un élément
        </button>
      </div>

      <div className="grid gap-4">
        {budgetElements.map((element) => (
          <div key={element.id} className="card flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{element.label}</h3>
              <p className={element.type === TRANSACTION_TYPES.CREDIT ? 'text-green-500' : 'text-red-500'}>
                {element.monthlyValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-sm text-gray-400">
                {getHolderName(element.holderId)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigate(`/budget-elements/${element.id}`)}
                className="btn-secondary"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(element.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetElements;
