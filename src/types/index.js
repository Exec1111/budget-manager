export const TRANSACTION_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
};

export const initialBudgetElement = {
  type: TRANSACTION_TYPES.DEBIT,
  label: '',
  monthlyValue: 0,
  savingsId: null,
  holderId: '',
};

export const initialSavings = {
  label: '',
  balance: 0,
};

export const initialHolder = {
  firstName: '',
  lastName: '',
};
