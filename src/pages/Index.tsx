
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { WhatsAppSimulator } from '@/components/WhatsAppSimulator';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';

const Index = () => {
  const { user } = useAuth();
  const { transactions, addTransaction } = useTransactions();

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dashboard */}
          <div className="order-2 lg:order-1">
            <Dashboard transactions={transactions} />
          </div>
          
          {/* WhatsApp Simulator */}
          <div className="order-1 lg:order-2">
            <WhatsAppSimulator 
              transactions={transactions}
              onAddTransaction={addTransaction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
