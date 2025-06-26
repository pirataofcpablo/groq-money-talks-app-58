import { formatCurrency } from './formatters';
import { getTodayTransactions, getToday } from './dateUtils';
import { Transaction } from '@/hooks/useTransactions';

export const processMessage = async (
  message: string, 
  transactions: Transaction[], 
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'user_phone'>) => void
): Promise<string> => {
  const lowerMessage = message.toLowerCase().trim();
  console.log('=== PROCESSANDO MENSAGEM ===');
  console.log('Mensagem original:', message);
  console.log('Mensagem em lowercase:', lowerMessage);
  console.log('Total de transações:', transactions.length);

  // Palavras-chave para gastos
  const gastoKeywords = ['gastei', 'comprei', 'paguei'];
  const hasGastoKeyword = gastoKeywords.some(keyword => lowerMessage.includes(keyword));

  // Palavras-chave para ganhos
  const ganhoKeywords = ['ganhei', 'recebi', 'vendi', 'lucrei'];
  const hasGanhoKeyword = ganhoKeywords.some(keyword => lowerMessage.includes(keyword));

  // Processar registro de gasto
  if (hasGastoKeyword) {
    console.log('Detectada palavra-chave de gasto');
    
    // Padrões mais flexíveis para extrair valor e descrição
    const gastoPatterns = [
      // "gastei 20 com marmita", "comprei uma pizza de 30", "paguei 50 de gasolina"
      /(?:gastei|comprei|paguei)\s+(?:uma?|um)?\s*([a-zA-ZÀ-ÿ\s]*?)\s+(?:de|por)?\s*(\d+(?:,\d{1,2})?)/i,
      // "gastei 20 com marmita", "comprei 30 de pizza"
      /(?:gastei|comprei|paguei)\s+(\d+(?:,\d{1,2})?)\s+(?:com|de|em|no|na|para)\s+(.+)/i,
      // "comprei uma marmita de 20"
      /(?:gastei|comprei|paguei)\s+(?:uma?|um)\s+(.+?)\s+(?:de|por)\s+(\d+(?:,\d{1,2})?)/i,
      // Padrão simples: qualquer número na mensagem
      /(\d+(?:,\d{1,2})?)/
    ];

    let value: number = 0;
    let description: string = '';
    let matched = false;

    for (const pattern of gastoPatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        console.log('Match encontrado:', match);
        
        if (pattern.source.includes('(.+?)')) {
          // Padrão "comprei uma marmita de 20"
          description = match[1].trim();
          value = parseFloat(match[2].replace(',', '.'));
        } else if (pattern.source.includes('(.+)')) {
          // Padrão "gastei 20 com marmita"
          value = parseFloat(match[1].replace(',', '.'));
          description = match[2].trim();
        } else if (pattern.source.includes('([a-zA-ZÀ-ÿ\\s]*?)')) {
          // Padrão "gastei uma marmita de 20"
          description = match[1].trim() || 'Item';
          value = parseFloat(match[2].replace(',', '.'));
        } else {
          // Padrão simples - apenas número
          value = parseFloat(match[1].replace(',', '.'));
          description = 'Gasto';
        }
        
        matched = true;
        break;
      }
    }

    if (matched && value > 0) {
      if (!description || description.trim() === '') {
        description = 'Gasto';
      }

      const transaction: Omit<Transaction, 'id' | 'user_phone'> = {
        type: 'gasto',
        value,
        description: description.trim(),
        timestamp: new Date().toISOString()
      };
      
      console.log('Transação de gasto criada:', transaction);
      await onAddTransaction(transaction);
      return `✅ Gasto registrado com sucesso!\n💸 Valor: ${formatCurrency(value)}\n📝 Descrição: ${description}`;
    }
  }

  // Processar registro de ganho
  if (hasGanhoKeyword) {
    console.log('Detectada palavra-chave de ganho');
    
    // Padrões mais flexíveis para extrair valor e descrição
    const ganhoPatterns = [
      // "ganhei 50 do freelance", "recebi 40 da venda"
      /(?:ganhei|recebi|vendi|lucrei)\s+(\d+(?:,\d{1,2})?)\s+(?:do|da|de|com|no|na|em)\s+(.+)/i,
      // "vendi uma camiseta por 30", "recebi um pix de 40"
      /(?:ganhei|recebi|vendi|lucrei)\s+(?:uma?|um)?\s*(.+?)\s+(?:por|de)\s+(\d+(?:,\d{1,2})?)/i,
      // "lucrei 30 com o sistema"
      /(?:ganhei|recebi|vendi|lucrei)\s+(\d+(?:,\d{1,2})?)\s+(.+)/i,
      // Padrão simples: qualquer número na mensagem
      /(\d+(?:,\d{1,2})?)/
    ];

    let value: number = 0;
    let description: string = '';
    let matched = false;

    for (const pattern of ganhoPatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        console.log('Match encontrado:', match);
        
        if (pattern.source.includes('(.+?)')) {
          // Padrão "vendi uma camiseta por 30"
          description = match[1].trim();
          value = parseFloat(match[2].replace(',', '.'));
        } else if (pattern.source.includes('(.+)') && !pattern.source.includes('(.+?)')) {
          // Padrão "ganhei 50 do freelance" ou "lucrei 30 com sistema"
          if (match[2]) {
            value = parseFloat(match[1].replace(',', '.'));
            description = match[2].trim();
          } else {
            value = parseFloat(match[1].replace(',', '.'));
            description = 'Ganho';
          }
        } else {
          // Padrão simples - apenas número
          value = parseFloat(match[1].replace(',', '.'));
          description = 'Ganho';
        }
        
        matched = true;
        break;
      }
    }

    if (matched && value > 0) {
      if (!description || description.trim() === '') {
        description = 'Ganho';
      }

      const transaction: Omit<Transaction, 'id' | 'user_phone'> = {
        type: 'lucro',
        value,
        description: description.trim(),
        timestamp: new Date().toISOString()
      };
      
      console.log('Transação de ganho criada:', transaction);
      await onAddTransaction(transaction);
      return `✅ Ganho registrado com sucesso!\n💰 Valor: ${formatCurrency(value)}\n📝 Fonte: ${description}`;
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
  console.log('Mensagem não reconhecida, retornando ajuda');
  return `🤖 Não entendi sua mensagem. Você pode usar:\n\n💸 GASTOS (use: gastei, comprei, paguei):\n• "gastei 20 com marmita"\n• "comprei uma pizza de 30"\n• "paguei 50 de gasolina"\n\n💰 GANHOS (use: ganhei, recebi, vendi, lucrei):\n• "ganhei 50 do freelance"\n• "recebi um pix de 40"\n• "vendi produto por 20"\n\n📊 RELATÓRIOS:\n• "gastos do dia"\n• "lucro do dia"\n• "saldo do dia"`;
};
