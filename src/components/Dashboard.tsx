
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { getTodayTransactions } from '@/utils/dateUtils';
import { Transaction } from '@/hooks/useTransactions';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { WhatsAppConnection } from './WhatsAppConnection';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard = ({ transactions }: DashboardProps) => {
  const todayTransactions = getTodayTransactions(transactions);
  const todayExpenses = todayTransactions.filter(t => t.type === 'gasto');
  const todayIncome = todayTransactions.filter(t => t.type === 'lucro');
  
  const totalExpenses = todayExpenses.reduce((sum, t) => sum + t.value, 0);
  const totalIncome = todayIncome.reduce((sum, t) => sum + t.value, 0);
  const balance = totalIncome - totalExpenses;

  const allExpenses = transactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.value, 0);
  const allIncome = transactions.filter(t => t.type === 'lucro').reduce((sum, t) => sum + t.value, 0);
  const totalBalance = allIncome - allExpenses;

  return (
    <div className="space-y-6">
      {/* WhatsApp Connection */}
      <WhatsAppConnection />
      
      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayExpenses.length} transação(ões)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayIncome.length} transação(ões)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transação(ões) total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Suas últimas movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma transação encontrada.</p>
              <p className="text-sm mt-2">Comece enviando uma mensagem no WhatsApp ou no simulador ao lado!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {transaction.type === 'gasto' ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'gasto' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'gasto' ? '-' : '+'}
                    {formatCurrency(transaction.value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
