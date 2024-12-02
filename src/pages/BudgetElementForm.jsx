import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { TRANSACTION_TYPES, initialBudgetElement } from '../types';

const BudgetElementForm = () => {
  console.log('Rendu du composant BudgetElementForm');
  
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    budgetElements,
    savings,
    holders,
    addBudgetElement,
    updateBudgetElement
  } = useBudget();

  console.log('Context values:', { 
    budgetElementsCount: budgetElements?.length,
    savingsCount: savings?.length,
    holdersCount: holders?.length,
    hasAddFunction: !!addBudgetElement,
    hasUpdateFunction: !!updateBudgetElement
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultElement = {
    ...initialBudgetElement,
    type: TRANSACTION_TYPES.DEBIT,
    holderId: '',
    savingsId: null,
    monthlyValue: 0
  };

  const [currentElement, setCurrentElement] = useState(defaultElement);

  useEffect(() => {
    console.log('Initializing form with holders:', holders);
    if (id) {
      const elementToEdit = budgetElements.find(element => element.id === id);
      if (elementToEdit) {
        console.log('Loading existing element:', elementToEdit);
        setCurrentElement(elementToEdit);
      } else {
        navigate('/budget-elements');
      }
    } else if (holders.length > 0 && !currentElement.holderId) {
      console.log('Setting default holder:', holders[0]);
      setCurrentElement(prev => ({
        ...prev,
        holderId: ''
      }));
    }
  }, [id, budgetElements, holders, navigate, currentElement.holderId]);

  useEffect(() => {
    console.log('BudgetElementForm mounted');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setError('');
    setIsSubmitting(true);
    
    try {
      console.log('Validating form data');
      if (!currentElement.label.trim()) {
        setError('Le libellé est requis');
        return;
      }

      if (!currentElement.holderId) {
        setError('Le titulaire est requis');
        return;
      }

      if (currentElement.monthlyValue <= 0) {
        setError('Le montant mensuel doit être supérieur à 0');
        return;
      }

      const elementToSave = {
        type: currentElement.type,
        label: currentElement.label.trim(),
        monthlyValue: parseFloat(currentElement.monthlyValue),
        holderId: currentElement.holderId,
        savingsId: currentElement.savingsId || null
      };

      console.log('Data to save:', elementToSave);

      if (id) {
        console.log('Updating element:', id);
        await updateBudgetElement(id, elementToSave);
      } else {
        console.log('Creating new element');
        await addBudgetElement(elementToSave);
      }

      console.log('Operation successful, redirecting');
      navigate('/budget-elements');
    } catch (error) {
      console.error('Error during form submission:', error);
      setError(error.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSavingsOptions = () => (
    <>
      <option value="">Aucune épargne</option>
      {savings.map(saving => (
        <option key={saving.id} value={saving.id}>
          {saving.label}
        </option>
      ))}
    </>
  );

  console.log('Current form state:', currentElement);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-flup-orange">
          {id ? 'Modifier l\'élément' : 'Nouvel élément'}
        </h1>
        <button
          type="button"
          onClick={() => navigate('/budget-elements')}
          className="btn-secondary"
        >
          Retour
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block mb-1">Type</label>
          <select
            value={currentElement.type}
            onChange={(e) => setCurrentElement({ ...currentElement, type: e.target.value })}
            className="input-field w-full"
            required
          >
            <option value={TRANSACTION_TYPES.DEBIT}>Débit</option>
            <option value={TRANSACTION_TYPES.CREDIT}>Crédit</option>
            <option value={TRANSACTION_TYPES.MONTHLY}>Mensuel</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Libellé</label>
          <input
            type="text"
            value={currentElement.label}
            onChange={(e) => setCurrentElement({ ...currentElement, label: e.target.value })}
            className="input-field w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Montant mensuel (€)</label>
          <input
            type="number"
            value={currentElement.monthlyValue || ''}
            onChange={(e) => setCurrentElement({ 
              ...currentElement, 
              monthlyValue: e.target.value ? parseFloat(e.target.value) : 0 
            })}
            className="input-field w-full"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block mb-1">Titulaire</label>
          <select
            value={currentElement.holderId || ''}
            onChange={(e) => {
              console.log('Holder selection changed:', e.target.value);
              setCurrentElement(prev => ({
                ...prev,
                holderId: e.target.value
              }));
            }}
            className="input-field w-full"
            required
          >
            <option value="">Sélectionner un titulaire</option>
            {holders.map(holder => (
              <option key={holder.id} value={holder.id}>
                {holder.firstName} {holder.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Épargne (optionnel)</label>
          <select
            value={currentElement.savingsId || ''}
            onChange={(e) => setCurrentElement({ ...currentElement, savingsId: e.target.value || null })}
            className="input-field w-full"
          >
            {renderSavingsOptions()}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/budget-elements')}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || !currentElement.holderId || !currentElement.label || currentElement.monthlyValue <= 0}
          >
            {isSubmitting ? 'Enregistrement...' : (id ? 'Modifier' : 'Ajouter')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetElementForm;
