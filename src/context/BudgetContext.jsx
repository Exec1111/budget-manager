import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initialSavings, initialOperation, TRANSACTION_TYPES, OPERATION_TYPES } from '../types';
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  arrayUnion
} from 'firebase/firestore';

const BudgetContext = createContext();

export const useBudget = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const [holders, setHolders] = useState([]);
  const [savings, setSavings] = useState([]);
  const [budgetElements, setBudgetElements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load holders
        const holdersQuery = query(collection(db, 'holders'), orderBy('lastName'));
        const holdersSnapshot = await getDocs(holdersQuery);
        const holdersData = holdersSnapshot.docs.map(doc => ({
          id: doc.id, // Ensure ID is always included
          ...doc.data()
        }));
        
        // Check and fix holders without ID
        const holderPromises = holdersData.map(async holder => {
          if (!holder.id) {
            console.log('Fixing holder without ID:', holder);
            // Create a new document with an ID
            const newDocRef = await addDoc(collection(db, 'holders'), {
              firstName: holder.firstName,
              lastName: holder.lastName,
              createdAt: serverTimestamp()
            });
            
            console.log('New document created with ID:', newDocRef.id);
            return {
              id: newDocRef.id,
              firstName: holder.firstName,
              lastName: holder.lastName
            };
          }
          return holder;
        });
        
        const correctedHolders = await Promise.all(holderPromises);
        setHolders(correctedHolders);

        // Load savings
        const savingsQuery = query(collection(db, 'savings'), orderBy('label'));
        const savingsSnapshot = await getDocs(savingsQuery);
        const savingsData = savingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          operations: doc.data().operations || []
        }));
        setSavings(savingsData);

        // Load budget elements
        const elementsQuery = query(collection(db, 'budgetElements'), orderBy('label'));
        const elementsSnapshot = await getDocs(elementsQuery);
        const elementsData = elementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBudgetElements(elementsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Holders CRUD
  const addHolder = async (holder) => {
    console.log('Start addHolder with:', holder);
    try {
      // Create a new document with an automatically generated ID
      const docRef = await addDoc(collection(db, 'holders'), {
        firstName: holder.firstName,
        lastName: holder.lastName,
        createdAt: serverTimestamp()
      });
      
      console.log('Document created successfully, ID:', docRef.id);
      
      const newHolder = {
        id: docRef.id,
        firstName: holder.firstName,
        lastName: holder.lastName
      };
      
      console.log('New element to add to state:', newHolder);
      setHolders(prev => [...prev, newHolder]);
      console.log('State updated successfully');
      
      return newHolder;
    } catch (error) {
      console.error('Detailed error in addHolder:', error);
      throw new Error(`Error adding element: ${error.message}`);
    }
  };

  const updateHolder = async (id, updatedHolder) => {
    console.log('Start updateHolder with ID:', id, 'and data:', updatedHolder);
    try {
      const holderRef = doc(db, 'holders', id);
      await updateDoc(holderRef, {
        ...updatedHolder,
        updatedAt: new Date()
      });
      console.log('Document updated successfully');
      
      setHolders(prev => 
        prev.map(holder => 
          holder.id === id ? { ...holder, ...updatedHolder } : holder
        )
      );
      console.log('State updated successfully');
    } catch (error) {
      console.error('Detailed error in updateHolder:', error);
      throw new Error(`Error updating element: ${error.message}`);
    }
  };

  const deleteHolder = async (id) => {
    console.log('Start deleteHolder with ID:', id);
    try {
      if (!id) {
        throw new Error('Holder ID missing');
      }

      const holderRef = doc(db, 'holders', id);
      console.log('Reference of document to delete:', holderRef.path);
      
      await deleteDoc(holderRef);
      console.log('Document deleted successfully');
      
      setHolders(prev => prev.filter(holder => holder.id !== id));
      console.log('State updated successfully');
    } catch (error) {
      console.error('Detailed error in deleteHolder:', error);
      throw new Error(`Error deleting element: ${error.message}`);
    }
  };

  // Savings CRUD
  const addSaving = async (saving) => {
    console.log('Start addSaving with:', saving);
    try {
      const docRef = await addDoc(collection(db, 'savings'), {
        ...saving,
        operations: [],
        createdAt: new Date()
      });
      console.log('Document created successfully, ID:', docRef.id);
      
      const newSaving = { 
        ...initialSavings,
        ...saving,
        id: docRef.id,
        operations: []
      };
      console.log('New element to add to state:', newSaving);
      
      setSavings(prev => [...prev, newSaving]);
      console.log('State updated successfully');
      
      return newSaving;
    } catch (error) {
      console.error('Detailed error in addSaving:', error);
      throw new Error(`Error adding element: ${error.message}`);
    }
  };

  const updateSaving = async (id, updatedSaving) => {
    console.log('Start updateSaving with ID:', id, 'and data:', updatedSaving);
    try {
      const savingRef = doc(db, 'savings', id);
      await updateDoc(savingRef, {
        ...updatedSaving,
        updatedAt: new Date()
      });
      console.log('Document updated successfully');
      
      setSavings(prev => 
        prev.map(saving => 
          saving.id === id ? { ...saving, ...updatedSaving } : saving
        )
      );
      console.log('State updated successfully');
    } catch (error) {
      console.error('Detailed error in updateSaving:', error);
      throw new Error(`Error updating element: ${error.message}`);
    }
  };

  const deleteSaving = async (id) => {
    console.log('Start deleteSaving with ID:', id);
    try {
      await deleteDoc(doc(db, 'savings', id));
      console.log('Document deleted successfully');
      
      setSavings(prev => prev.filter(saving => saving.id !== id));
      console.log('State updated successfully');
    } catch (error) {
      console.error('Detailed error in deleteSaving:', error);
      throw new Error(`Error deleting element: ${error.message}`);
    }
  };

  // Operations
  const addOperation = async (savingId, operation) => {
    try {
      console.log('Adding operation:', operation);
      const savingRef = doc(db, 'savings', savingId);
      const saving = savings.find(s => s.id === savingId);

      if (!saving) {
        console.error('Saving not found');
        return;
      }

      // Calcul du nouveau solde
      let balanceChange;
      
      // Pour les opérations mensuelles, toujours créditer l'épargne
      if (operation.type === OPERATION_TYPES.MONTHLY) {
        console.log('Monthly operation detected, adding amount:', operation.amount);
        balanceChange = operation.amount;
      } else if (operation.type === OPERATION_TYPES.WITHDRAWAL) {
        balanceChange = -operation.amount;
      } else { // DEPOSIT
        balanceChange = operation.amount;
      }

      console.log('Current balance:', saving.balance);
      console.log('Balance change:', balanceChange);
      
      const newBalance = saving.balance + balanceChange;
      console.log('New balance:', newBalance);

      // Création de l'opération avec toutes les informations nécessaires
      const operationWithId = {
        id: uuidv4(),
        type: operation.type,
        amount: operation.amount,
        date: operation.date,
        balanceAfter: newBalance,
        budgetElementId: operation.budgetElementId,
        createdAt: new Date().toISOString()
      };

      // Récupérer les opérations existantes et ajouter la nouvelle
      const updatedOperations = [...saving.operations, operationWithId];

      // Mise à jour de l'épargne dans Firestore
      const updateData = {
        balance: newBalance,
        operations: updatedOperations,
        updatedAt: serverTimestamp()
      };

      console.log('Updating Firestore with:', updateData);

      await updateDoc(savingRef, updateData);

      // Mise à jour du state local
      setSavings(prevSavings =>
        prevSavings.map(s =>
          s.id === savingId
            ? {
                ...s,
                balance: newBalance,
                operations: updatedOperations
              }
            : s
        )
      );

      console.log('Operation added successfully, new balance:', newBalance);
    } catch (error) {
      console.error('Error adding operation:', error);
      throw error;
    }
  };

  // Budget Elements CRUD
  const addBudgetElement = async (elementData) => {
    console.log('[BudgetContext] Start addBudgetElement with data:', elementData);
    try {
      const docRef = doc(collection(db, 'budgetElements'));
      console.log('[BudgetContext] Generated ID for new document:', docRef.id);

      const elementWithId = {
        ...elementData,
        id: docRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      console.log('[BudgetContext] Document to save:', elementWithId);

      await setDoc(docRef, elementWithId);
      console.log('[BudgetContext] Document saved successfully');

      setBudgetElements(prev => {
        console.log('[BudgetContext] Updating state with new element');
        return [...prev, { ...elementWithId, createdAt: new Date(), updatedAt: new Date() }];
      });

      console.log('[BudgetContext] Operation completed successfully');
      return elementWithId;
    } catch (error) {
      console.error('[BudgetContext] Error in addBudgetElement:', error);
      throw new Error(`Error adding element: ${error.message}`);
    }
  };

  const updateBudgetElement = async (id, updatedElement) => {
    console.log('Start updateBudgetElement with ID:', id, 'and data:', updatedElement);
    try {
      const elementRef = doc(db, 'budgetElements', id);
      await updateDoc(elementRef, {
        ...updatedElement,
        updatedAt: new Date()
      });
      console.log('Document updated successfully');
      
      setBudgetElements(prev => 
        prev.map(element => 
          element.id === id ? { ...element, ...updatedElement } : element
        )
      );
      console.log('State updated successfully');
    } catch (error) {
      console.error('Detailed error in updateBudgetElement:', error);
      throw new Error(`Error updating element: ${error.message}`);
    }
  };

  const deleteBudgetElement = async (id) => {
    console.log('Start deleteBudgetElement with ID:', id);
    try {
      await deleteDoc(doc(db, 'budgetElements', id));
      console.log('Document deleted successfully');
      
      setBudgetElements(prev => prev.filter(element => element.id !== id));
      console.log('State updated successfully');
    } catch (error) {
      console.error('Detailed error in deleteBudgetElement:', error);
      throw new Error(`Error deleting element: ${error.message}`);
    }
  };

  // Monthly calculations
  const calculateMonthlyIncome = () => {
    return budgetElements
      .filter(element => element.type === TRANSACTION_TYPES.CREDIT)
      .reduce((total, element) => total + element.monthlyValue, 0);
  };

  const calculateMonthlyExpenses = () => {
    return budgetElements
      .filter(element => element.type === TRANSACTION_TYPES.DEBIT)
      .reduce((total, element) => total + element.monthlyValue, 0);
  };

  const value = {
    holders,
    savings,
    budgetElements,
    loading,
    addHolder,
    updateHolder,
    deleteHolder,
    addSaving,
    updateSaving,
    deleteSaving,
    addOperation,
    getOperationHistory: (savingId) => {
      const saving = savings.find(s => s.id === savingId);
      return saving ? saving.operations : [];
    },
    addBudgetElement,
    updateBudgetElement,
    deleteBudgetElement,
    calculateMonthlyIncome,
    calculateMonthlyExpenses
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
