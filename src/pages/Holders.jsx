import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { initialHolder } from '../types';

const Holders = () => {
  const { holders, addHolder, updateHolder, deleteHolder } = useBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHolder, setCurrentHolder] = useState(initialHolder);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateHolder(currentHolder.id, currentHolder);
    } else {
      addHolder(currentHolder);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentHolder(initialHolder);
    setIsEditing(false);
  };

  const handleEdit = (holder) => {
    setCurrentHolder(holder);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce titulaire ?')) {
      deleteHolder(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-flup-orange">Titulaires</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          Nouveau titulaire
        </button>
      </div>

      {/* Liste des titulaires */}
      <div className="grid gap-4">
        {holders.map((holder) => (
          <div key={holder.id} className="card flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                {holder.firstName} {holder.lastName}
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(holder)}
                className="btn-secondary"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(holder.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-secondary p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {isEditing ? 'Modifier le titulaire' : 'Nouveau titulaire'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Prénom</label>
                <input
                  type="text"
                  value={currentHolder.firstName}
                  onChange={(e) => setCurrentHolder({ ...currentHolder, firstName: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Nom</label>
                <input
                  type="text"
                  value={currentHolder.lastName}
                  onChange={(e) => setCurrentHolder({ ...currentHolder, lastName: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holders;
