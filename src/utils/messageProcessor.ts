
import { formatCurrency } from './formatters';
import { getTodayTransactions, getToday } from './dateUtils';

export const processMessage = async (
  message: string, 
  transactions: any[], 
  onAddTransaction: (transaction: any) => void
): Promise<string> => {
  const lowerMessage = message.toLowerCase().trim();

  // Processar registro de gasto
  if (lowerMessage.includes('gastei')) {
    const match = lowerMessage.match(/gastei\s+(\d+(?:,\d+)?)\s+(?:com|no|na|em)\s+(.+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      const description = match[2].trim();
      
      const transaction = {
        id: Date.now().toString(),
        type: 'gasto',
        value,
        description,
        timestamp: new Date().toISOString(),
        user_id: 'whatsapp_user'
      };
      
      onAddTransaction(transaction);
      return `✅ Registro de gasto confirmado!\n💸 Valor: ${formatCurrency(value)}\n📝 Descrição: ${description}`;
    }
    return '❌ Não consegui entender o valor ou descrição do gasto. Use o formato: "gastei 20 com marmita"';
  }

  // Processar registro de ganho
  if (lowerMessage.includes('ganhei')) {
    const match = lowerMessage.match(/ganhei\s+(\d+(?:,\d+)?)\s+(?:do|da|de|com)\s+(.+)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      const description = match[2].trim();
      
      const transaction = {
        id: Date.now().toString(),
        type: 'lucro',
        value,
        description,
        timestamp: new Date().toISOString(),
        user_id: 'whatsapp_user'
      };
      
      onAddTransaction(transaction);
      return `✅ Registro de ganho confirmado!\n💰 Valor: ${formatCurrency(value)}\n📝 Fonte: ${description}`;
    }
    return '❌ Não consegui entender o valor ou fonte do ganho. Use o formato: "ganhei 50 do freelance"';
  }

  // Relatório de despesas do dia
  if (lowerMessage.includes('despesa do dia') || lowerMessage.includes('gastos do dia')) {
    const todayTransactions = getTodayTransactions(transactions);
    const expenses = todayTransactions.filter(t => t.type === 'gasto');
    
    if (expenses.length === 0) {
      return `📊 Relatório de Despesas - ${getToday()}\n\n✨ Parabéns! Você não teve gastos hoje.`;
    }
    
    const total = expenses.reduce((sum, t) => sum + t.value, 0);
    let report = `📊 Relatório de Despesas - ${getToday()}\n\n`;
    
    expenses.forEach((expense, index) => {
      report += `${index + 1}. ${expense.description}: ${formatCurrency(expense.value)}\n`;
    });
    
    report += `\n💸 Total gasto hoje: ${formatCurrency(total)}`;
    return report;
  }

  // Relatório de lucros do dia
  if (lowerMessage.includes('lucro do dia') || lowerMessage.includes('ganhos do dia')) {
    const todayTransactions = getTodayTransactions(transactions);
    const income = todayTransactions.filter(t => t.type === 'lucro');
    
    if (income.length === 0) {
      return `📊 Relatório de Ganhos - ${getToday()}\n\n📈 Você ainda não registrou ganhos hoje.`;
    }
    
    const total = income.reduce((sum, t) => sum + t.value, 0);
    let report = `📊 Relatório de Ganhos - ${getToday()}\n\n`;
    
    income.forEach((gain, index) => {
      report += `${index + 1}. ${gain.description}: ${formatCurrency(gain.value)}\n`;
    });
    
    report += `\n💰 Total ganho hoje: ${formatCurrency(total)}`;
    return report;
  }

  // Saldo do dia
  if (lowerMessage.includes('saldo do dia') || lowerMessage.includes('resumo do dia')) {
    const todayTransactions = getTodayTransactions(transactions);
    const expenses = todayTransactions.filter(t => t.type === 'gasto');
    const income = todayTransactions.filter(t => t.type === 'lucro');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.value, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.value, 0);
    const balance = totalIncome - totalExpenses;
    
    let report = `📊 Resumo Financeiro - ${getToday()}\n\n`;
    report += `💰 Ganhos: ${formatCurrency(totalIncome)}\n`;
    report += `💸 Gastos: ${formatCurrency(totalExpenses)}\n`;
    report += `📈 Saldo: ${formatCurrency(balance)}\n\n`;
    
    if (balance > 0) {
      report += `✅ Parabéns! Você teve um saldo positivo hoje!`;
    } else if (balance < 0) {
      report += `⚠️ Atenção! Seus gastos superaram os ganhos hoje.`;
    } else {
      report += `⚖️ Você está equilibrado hoje!`;
    }
    
    return report;
  }

  // Mensagem não reconhecida
  return `🤖 Não entendi sua mensagem. Você pode usar:\n\n• "gastei 20 com marmita" - para registrar gastos\n• "ganhei 50 do freelance" - para registrar ganhos\n• "despesa do dia" - ver gastos de hoje\n• "lucro do dia" - ver ganhos de hoje\n• "saldo do dia" - resumo completo`;
};
