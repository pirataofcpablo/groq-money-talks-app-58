
import { useState, useEffect } from 'react';
import { MessageProcessor } from '@/components/MessageProcessor';
import { Dashboard } from '@/components/Dashboard';
import { WhatsAppSimulator } from '@/components/WhatsAppSimulator';
import { Header } from '@/components/Header';

const Index = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Caregar dados do localStorage
    const savedTransactions = localStorage.getItem('financial-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const addTransaction = (transaction: any) => {
    const newTransactions = [...transactions, transaction];
    setTransactions(newTransactions);
    localStorage.setItem('financial-transactions', JSON.stringify(newTransactions));
  };

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
      
      <MessageProcessor />
    </div>
  );
};

export default Index;
