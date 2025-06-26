
import { DollarSign } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Controle Financeiro WhatsApp
            </h1>
            <p className="text-gray-600 text-sm">
              Gerencie seus gastos e ganhos via mensagens
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
