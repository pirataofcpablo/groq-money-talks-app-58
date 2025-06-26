
import { useState, useCallback } from 'react';
import { evolutionApi } from '@/services/evolutionApi';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface WhatsAppConnection {
  instanceName: string;
  status: 'creating' | 'waiting_qr' | 'connected' | 'disconnected';
  qrCode?: string;
}

export const useWhatsApp = () => {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateInstanceName = useCallback(() => {
    if (!user) return '';
    return `financial_${user.phone}_${Date.now()}`;
  }, [user]);

  const createConnection = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      const instanceName = generateInstanceName();
      
      console.log('Criando conexão WhatsApp para:', user.phone);
      
      setConnection({
        instanceName,
        status: 'creating'
      });

      // Criar instância
      await evolutionApi.createInstance(instanceName);
      
      // Aguardar um pouco para a instância ser criada
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Obter QR Code
      const qrResponse = await evolutionApi.getQRCode(instanceName);
      
      setConnection(prev => prev ? {
        ...prev,
        status: 'waiting_qr',
        qrCode: qrResponse.base64
      } : null);

      // Verificar status da conexão periodicamente
      const statusInterval = setInterval(async () => {
        try {
          const status = await evolutionApi.getInstanceStatus(instanceName);
          console.log('Status da instância:', status);
          
          if (status.instance.state === 'open') {
            setConnection(prev => prev ? { ...prev, status: 'connected' } : null);
            clearInterval(statusInterval);
            
            // Enviar mensagem de boas-vindas
            const welcomeMessage = `🤖 Olá! Sou seu controle financeiro pessoal!

Agora você pode enviar seus gastos e ganhos diretamente pelo WhatsApp:

💸 GASTOS (use: gastei, comprei, paguei):
• "gastei 20 com marmita"
• "comprei uma pizza de 30"
• "paguei 50 de gasolina"

💰 GANHOS (use: ganhei, recebi, vendi, lucrei):
• "ganhei 50 do freelance"  
• "recebi um pix de 40"
• "vendi produto por 20"

📊 RELATÓRIOS:
• "gastos do dia"
• "lucro do dia"
• "saldo do dia"

Estou aqui para ajudar você a controlar suas finanças! 🚀`;

            // Aguardar um pouco antes de enviar a mensagem
            setTimeout(async () => {
              try {
                await evolutionApi.sendMessage(instanceName, user.phone, welcomeMessage);
                toast.success('WhatsApp conectado com sucesso!');
              } catch (error) {
                console.error('Erro ao enviar mensagem de boas-vindas:', error);
              }
            }, 3000);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000);

      // Limpar interval depois de 5 minutos se não conectar
      setTimeout(() => {
        clearInterval(statusInterval);
        setConnection(prev => {
          if (prev && prev.status === 'waiting_qr') {
            return { ...prev, status: 'disconnected' };
          }
          return prev;
        });
      }, 300000);

    } catch (error) {
      console.error('Erro ao criar conexão WhatsApp:', error);
      toast.error('Erro ao conectar WhatsApp: ' + (error as Error).message);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, [user, generateInstanceName]);

  const disconnect = useCallback(async () => {
    if (!connection) return;

    try {
      setLoading(true);
      await evolutionApi.deleteInstance(connection.instanceName);
      setConnection(null);
      toast.success('WhatsApp desconectado');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  }, [connection]);

  return {
    connection,
    loading,
    createConnection,
    disconnect
  };
};
