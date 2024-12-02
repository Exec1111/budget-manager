export const TRANSACTION_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
  MONTHLY: 'monthly'
};

export const OPERATION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  MONTHLY: 'monthly'
};

export const initialSavings = {
  id: '',
  label: '',
  balance: 0,
  operations: [],
  linkedBudgetElements: []
};

export const initialOperation = {
  id: '',
  type: OPERATION_TYPES.DEPOSIT,
  amount: 0,
  date: new Date(),
  balanceAfter: 0,
  budgetElementId: null
};

export const initialHolder = {
  id: '',
  firstName: '',
  lastName: ''
};

export const initialBudgetElement = {
  id: '',
  type: TRANSACTION_TYPES.DEBIT,
  label: '',
  monthlyValue: 0,
  holderId: '',
  savingsId: null
};
