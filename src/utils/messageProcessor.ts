
import { formatCurrency } from './formatters';
import { getTodayTransactions, getToday } from './dateUtils';

export const processMessage = async (
  message: string, 
  transactions: any[], 
  onAddTransaction: (transaction: any) => void
): Promise<string> => {
  const lowerMessage = message.toLowerCase().trim();

  // Processar registro de gasto - expressões mais variadas
  const gastoPatterns = [
    /(?:gastei|comi|comprei|paguei)\s+(?:uma?|um)?\s*(?:\w+\s+)?(?:de\s+)?(\d+(?:,\d+)?)\s+(?:com|no|na|em|de|reais?\s+(?:com|no|na|em|de))\s+(.+)/i,
    /(?:gastei|comi|comprei|paguei)\s+(\d+(?:,\d+)?)\s+(?:com|no|na|em|de|reais?\s+(?:com|no|na|em|de))\s+(.+)/i,
    /(?:uma?|um)\s+(\w+)\s+de\s+(\d+(?:,\d+)?)/i
  ];

  for (const pattern of gastoPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      let value: number;
      let description: string;
      
      if (pattern.source.includes('uma?|um')) {
        // Padrão "uma marmita de 30"
        description = match[1];
        value = parseFloat(match[2].replace(',', '.'));
      } else {
        value = parseFloat(match[1].replace(',', '.'));
        description = match[2].trim();
      }
      
      const transaction = {
        id: Date.now().toString(),
        type: 'gasto',
        value,
        description,
        timestamp: new Date().toISOString(),
        user_phone: 'current_user'
      };
      
      onAddTransaction(transaction);
      return `✅ Registro de gasto confirmado!\n💸 Valor: ${formatCurrency(value)}\n📝 Descrição: ${description}`;
    }
  }

  // Processar registro de ganho - expressões mais variadas
  const lucroPatterns = [
    /(?:ganhei|lucrei|recebi|vendi)\s+(?:um|uma)?\s*(?:\w+\s+)?(?:de\s+)?(\d+(?:,\d+)?)\s+(?:do|da|de|com|no|na|em|reais?\s+(?:do|da|de|com|no|na|em))\s+(.+)/i,
    /(?:ganhei|lucrei|recebi|vendi)\s+(\d+(?:,\d+)?)\s+(?:do|da|de|com|no|na|em|reais?\s+(?:do|da|de|com|no|na|em))\s+(.+)/i,
    /(?:lucrei|ganhei)\s+(?:com|no|na|em)\s+(?:o|a)?\s*(.+?)\s+(\d+(?:,\d+)?)/i,
    /(?:recebi|ganhei)\s+(?:um|uma)\s+(?:pix|transferência|pagamento)\s+de\s+(\d+(?:,\d+)?)/i
  ];

  for (const pattern of lucroPatterns) {
    const match = lowerMessage.match(pattern);
    if (match) {
      let value: number;
      let description: string;
      
      if (pattern.source.includes('(.+?)\\s+(\\d+')) {
        // Padrão "lucrei com o sistema 30"
        description = match[1].trim();
        value = parseFloat(match[2].replace(',', '.'));
      } else if (pattern.source.includes('pix|transferência')) {
        // Padrão "recebi um pix de 40"
        value = parseFloat(match[1].replace(',', '.'));
        description = 'PIX/Transferência';
      } else {
        value = parseFloat(match[1].replace(',', '.'));
        description = match[2].trim();
      }
      
      const transaction = {
        id: Date.now().toString(),
        type: 'lucro',
        value,
        description,
        timestamp: new Date().toISOString(),
        user_phone: 'current_user'
      };
      
      onAddTransaction(transaction);
      return `✅ Registro de ganho confirmado!\n💰 Valor: ${formatCurrency(value)}\n📝 Fonte: ${description}`;
    }
  }

  // Relatório de despesas do dia - mais variações
  if (lowerMessage.includes('despesa do dia') || 
      lowerMessage.includes('gastos do dia') ||
      lowerMessage.includes('meu gasto do dia') ||
      lowerMessage.includes('gastei quanto') ||
      lowerMessage.match(/\bgastos?\b/)) {
    
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

  // Relatório de lucros do dia - mais variações
  if (lowerMessage.includes('lucro do dia') || 
      lowerMessage.includes('ganhos do dia') ||
      lowerMessage.includes('lucrei quanto') ||
      lowerMessage.includes('faturamento') ||
      lowerMessage.match(/\blucros?\b/)) {
    
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
  return `🤖 Não entendi sua mensagem. Você pode usar:\n\n• Gastos: "gastei 20 com marmita", "comprei uma pizza de 30", "paguei 50 de gasolina"\n• Ganhos: "ganhei 50 do freelance", "recebi um pix de 40", "vendi um produto de 20"\n• Relatórios: "gastos do dia", "lucro do dia", "faturamento", "saldo do dia"`;
};
