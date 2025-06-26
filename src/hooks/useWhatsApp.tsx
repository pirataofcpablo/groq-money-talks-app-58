
import { useState, useCallback } from 'react';
import { evolutionApi } from '@/services/evolutionApi';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface WhatsAppConnection {
  instanceName: string;
  status: 'creating' | 'waiting_qr' | 'connected' | 'disconnected' | 'qr_expired';
  qrCode?: string;
  qrAttempts: number;
}

export const useWhatsApp = () => {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateInstanceName = useCallback(() => {
    if (!user) return '';
    return `financial_${user.phone}_${Date.now()}`;
  }, [user]);

  const generateQRCode = useCallback(async (instanceName: string, attempt: number = 1) => {
    try {
      console.log(`Gerando QR Code - Tentativa ${attempt} para instância:`, instanceName);
      
      // Aguardar um pouco antes de tentar obter o QR Code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const qrResponse = await evolutionApi.getQRCode(instanceName);
      
      if (qrResponse.base64) {
        setConnection(prev => prev ? {
          ...prev,
          status: 'waiting_qr',
          qrCode: qrResponse.base64,
          qrAttempts: attempt
        } : null);
        
        // Configurar timeout para renovar QR Code (30 segundos)
        setTimeout(() => {
          setConnection(prev => {
            if (prev && prev.status === 'waiting_qr' && prev.qrAttempts === attempt) {
              return { ...prev, status: 'qr_expired' };
            }
            return prev;
          });
        }, 30000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      
      // Tentar novamente até 3 vezes
      if (attempt < 3) {
        console.log(`Tentando novamente em 2 segundos... (${attempt + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateQRCode(instanceName, attempt + 1);
      }
      
      throw error;
    }
  }, []);

  const refreshQRCode = useCallback(async () => {
    if (!connection) return;
    
    try {
      setLoading(true);
      setConnection(prev => prev ? { ...prev, status: 'creating' } : null);
      
      await generateQRCode(connection.instanceName, connection.qrAttempts + 1);
    } catch (error) {
      console.error('Erro ao renovar QR Code:', error);
      toast.error('Erro ao renovar QR Code. Tente reconectar.');
    } finally {
      setLoading(false);
    }
  }, [connection, generateQRCode]);

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
        status: 'creating',
        qrAttempts: 0
      });

      // Criar instância
      await evolutionApi.createInstance(instanceName);
      
      // Aguardar criação da instância
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Gerar QR Code
      await generateQRCode(instanceName);

      // Verificar status da conexão periodicamente
      const statusInterval = setInterval(async () => {
        try {
          const status = await evolutionApi.getInstanceStatus(instanceName);
          console.log('Status da instância:', status);
          
          if (status.instance.state === 'open') {
            setConnection(prev => prev ? { ...prev, status: 'connected' } : null);
            clearInterval(statusInterval);
            
            // Enviar mensagem de boas-vindas imediatamente
            const welcomeMessage = `👋 Olá! Você está conectado ao *Controle Financeiro Elite*.

Envie mensagens como:
- "gastei 20 com lanche"
- "ganhei 50 do pix"
- "despesa do dia"
- "lucro do dia"

E eu vou organizar tudo pra você! 💰📊

✅ *Assistente já está ativo e pronto para receber seus comandos financeiros!*`;

            // Enviar mensagem de boas-vindas após 2 segundos
            setTimeout(async () => {
              try {
                await evolutionApi.sendMessage(instanceName, user.phone, welcomeMessage);
                console.log('Mensagem de boas-vindas enviada com sucesso');
                toast.success('WhatsApp conectado! Mensagem de boas-vindas enviada.');
              } catch (error) {
                console.error('Erro ao enviar mensagem de boas-vindas:', error);
                toast.success('WhatsApp conectado! (Erro ao enviar mensagem de boas-vindas)');
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 3000);

      // Limpar interval depois de 5 minutos se não conectar
      setTimeout(() => {
        clearInterval(statusInterval);
        setConnection(prev => {
          if (prev && prev.status !== 'connected') {
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
  }, [user, generateInstanceName, generateQRCode]);

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
    disconnect,
    refreshQRCode
  };
};
