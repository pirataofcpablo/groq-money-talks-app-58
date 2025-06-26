
export const getToday = (): string => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getTodayTransactions = (transactions: any[]): any[] => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= startOfDay && transactionDate <= endOfDay;
  });
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};
