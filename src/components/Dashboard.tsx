
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { getToday, getTodayTransactions } from '@/utils/dateUtils';

interface DashboardProps {
  transactions: any[];
}

export const Dashboard = ({ transactions }: DashboardProps) => {
  const todayTransactions = getTodayTransactions(transactions);
  
  const todayExpenses = todayTransactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + t.value, 0);
    
  const todayIncome = todayTransactions
    .filter(t => t.type === 'lucro')
    .reduce((sum, t) => sum + t.value, 0);
    
  const balance = todayIncome - todayExpenses;

  const totalExpenses = transactions
    .filter(t => t.type === 'gasto')
    .reduce((sum, t) => sum + t.value, 0);
    
  const totalIncome = transactions
    .filter(t => t.type === 'lucro')
    .reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Financeiro</h2>
        <p className="text-gray-600">Resumo de hoje - {getToday()}</p>
      </div>

      {/* Cards do dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Gastos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(todayExpenses)}
            </div>
            <p className="text-xs text-red-500 mt-1">
              {todayTransactions.filter(t => t.type === 'gasto').length} transações
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Ganhos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(todayIncome)}
            </div>
            <p className="text-xs text-green-500 mt-1">
              {todayTransactions.filter(t => t.type === 'lucro').length} transações
            </p>
          </CardContent>
        </Card>

        <Card className={`border-blue-200 ${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${
              balance >= 0 ? 'text-blue-700' : 'text-orange-700'
            }`}>
              <DollarSign className="h-4 w-4" />
              Saldo Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              balance >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {formatCurrency(balance)}
            </div>
            <p className={`text-xs mt-1 ${
              balance >= 0 ? 'text-blue-500' : 'text-orange-500'
            }`}>
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Total */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total de Gastos</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Ganhos</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(-5).reverse().map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'gasto' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {transaction.type === 'gasto' ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${
                  transaction.type === 'gasto' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'gasto' ? '-' : '+'}{formatCurrency(transaction.value)}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Nenhuma transação registrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
