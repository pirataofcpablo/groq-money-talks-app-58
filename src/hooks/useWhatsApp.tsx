
import { useState, useCallback, useEffect, useRef } from 'react';
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
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const welcomeMessageSentRef = useRef<boolean>(false);

  const generateInstanceName = useCallback(() => {
    if (!user) return '';
    return `financial_${user.phone}_${Date.now()}`;
  }, [user]);

  const clearIntervals = useCallback(() => {
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
      qrIntervalRef.current = null;
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  const generateQRCode = useCallback(async (instanceName: string, attempt: number = 1) => {
    try {
      console.log(`Gerando QR Code - Tentativa ${attempt} para instância:`, instanceName);
      
      const qrResponse = await evolutionApi.getQRCode(instanceName);
      
      if (qrResponse.base64) {
        console.log('QR Code gerado com sucesso');
        setConnection(prev => prev ? {
          ...prev,
          status: 'waiting_qr',
          qrCode: qrResponse.base64,
          qrAttempts: attempt
        } : null);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      
      // Tentar novamente até 3 vezes
      if (attempt < 3) {
        console.log(`Tentando novamente em 3 segundos... (${attempt + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return generateQRCode(instanceName, attempt + 1);
      }
      
      throw error;
    }
  }, []);

  const startQRCodeRefresh = useCallback((instanceName: string) => {
    // Limpar qualquer interval anterior
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
    }

    // Recarregar QR Code a cada 60 segundos
    qrIntervalRef.current = setInterval(async () => {
      try {
        console.log('Recarregando QR Code automaticamente...');
        await generateQRCode(instanceName);
      } catch (error) {
        console.error('Erro ao recarregar QR Code:', error);
        // Marcar como expirado se falhar
        setConnection(prev => prev ? { ...prev, status: 'qr_expired' } : null);
      }
    }, 60000); // 60 segundos
  }, [generateQRCode]);

  const sendWelcomeMessage = useCallback(async (instanceName: string, userPhone: string) => {
    try {
      const welcomeMessage = `👋 Olá! Você está conectado ao *Controle Financeiro Elite*.

📲 Me envie mensagens como:
- "gastei 20 com lanche"
- "ganhei 50 do X salgado"
- "despesa do dia"
- "lucro do dia"

E eu organizo tudo pra você 💸📊

✅ *Sistema já está pronto para receber seus comandos!*`;

      await evolutionApi.sendMessage(instanceName, userPhone, welcomeMessage);
      console.log('Mensagem de boas-vindas enviada com sucesso');
      toast.success('WhatsApp conectado! Mensagem de boas-vindas enviada.');
      welcomeMessageSentRef.current = true;
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
      toast.success('WhatsApp conectado! (Erro ao enviar mensagem de boas-vindas)');
    }
  }, []);

  const refreshQRCode = useCallback(async () => {
    if (!connection) return;
    
    try {
      setLoading(true);
      setConnection(prev => prev ? { ...prev, status: 'creating' } : null);
      
      await generateQRCode(connection.instanceName, connection.qrAttempts + 1);
      
      // Reiniciar o ciclo de refresh
      startQRCodeRefresh(connection.instanceName);
    } catch (error) {
      console.error('Erro ao renovar QR Code:', error);
      toast.error('Erro ao renovar QR Code. Tente reconectar.');
    } finally {
      setLoading(false);
    }
  }, [connection, generateQRCode, startQRCodeRefresh]);

  const createConnection = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setLoading(true);
      clearIntervals();
      welcomeMessageSentRef.current = false;
      
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
      
      // Iniciar refresh automático do QR Code
      startQRCodeRefresh(instanceName);

      // Verificar status da conexão periodicamente
      statusIntervalRef.current = setInterval(async () => {
        try {
          const status = await evolutionApi.getInstanceStatus(instanceName);
          console.log('Status da instância:', status);
          
          if (status.instance.state === 'open') {
            console.log('WhatsApp conectado com sucesso!');
            
            // Parar todos os intervals
            clearIntervals();
            
            // Atualizar status
            setConnection(prev => prev ? { ...prev, status: 'connected' } : null);
            
            // Enviar mensagem de boas-vindas (apenas uma vez)
            if (!welcomeMessageSentRef.current) {
              setTimeout(() => {
                sendWelcomeMessage(instanceName, user.phone);
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 3000);

      // Limpar interval de status após 10 minutos se não conectar
      setTimeout(() => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
        
        setConnection(prev => {
          if (prev && prev.status !== 'connected') {
            return { ...prev, status: 'disconnected' };
          }
          return prev;
        });
      }, 600000); // 10 minutos

    } catch (error) {
      console.error('Erro ao criar conexão WhatsApp:', error);
      toast.error('Erro ao conectar WhatsApp: ' + (error as Error).message);
      setConnection(null);
      clearIntervals();
    } finally {
      setLoading(false);
    }
  }, [user, generateInstanceName, generateQRCode, startQRCodeRefresh, sendWelcomeMessage, clearIntervals]);

  const disconnect = useCallback(async () => {
    if (!connection) return;

    try {
      setLoading(true);
      clearIntervals();
      
      await evolutionApi.deleteInstance(connection.instanceName);
      setConnection(null);
      welcomeMessageSentRef.current = false;
      toast.success('WhatsApp desconectado');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  }, [connection, clearIntervals]);

  // Limpar intervals quando o componente for desmontado
  useEffect(() => {
    return () => {
      clearIntervals();
    };
  }, [clearIntervals]);

  return {
    connection,
    loading,
    createConnection,
    disconnect,
    refreshQRCode
  };
};
