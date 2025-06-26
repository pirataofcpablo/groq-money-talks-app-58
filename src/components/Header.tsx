
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Controle Financeiro WhatsApp
          </h1>
          {user && (
            <p className="text-sm text-gray-600">
              Logado como: {user.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
            </p>
          )}
        </div>
        
        {user && (
          <Button 
            onClick={signOut}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Sair
          </Button>
        )}
      </div>
    </header>
  );
};
