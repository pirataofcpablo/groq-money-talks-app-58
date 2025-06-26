
import { processMessage } from '@/utils/messageProcessor';
import { Transaction } from '@/hooks/useTransactions';

export interface WebhookMessage {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
    };
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageTimestamp: number;
  };
}

export const processWhatsAppMessage = async (
  webhookData: WebhookMessage,
  transactions: Transaction[],
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'user_phone'>) => void
): Promise<string | null> => {
  try {
    console.log('Processando mensagem do WhatsApp:', webhookData);

    // Verificar se a mensagem não é nossa (fromMe = false)
    if (webhookData.data.key.fromMe) {
      console.log('Mensagem enviada por nós, ignorando');
      return null;
    }

    // Extrair texto da mensagem
    const messageText = webhookData.data.message.conversation || 
                       webhookData.data.message.extendedTextMessage?.text;

    if (!messageText) {
      console.log('Mensagem sem texto, ignorando');
      return null;
    }

    console.log('Texto da mensagem:', messageText);

    // Processar mensagem usando o mesmo processador do simulador
    const response = await processMessage(messageText, transactions, onAddTransaction);
    
    console.log('Resposta processada:', response);
    return response;

  } catch (error) {
    console.error('Erro ao processar mensagem do WhatsApp:', error);
    return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
  }
};

// Função para extrair número de telefone do RemoteJid
export const extractPhoneFromJid = (remoteJid: string): string => {
  // RemoteJid geralmente vem no formato: 5511999999999@s.whatsapp.net
  return remoteJid.split('@')[0];
};

// Função para verificar se a mensagem é de um usuário autorizado
export const isAuthorizedUser = (remoteJid: string, userPhone: string): boolean => {
  const messagePhone = extractPhoneFromJid(remoteJid);
  // Remover formatação do número do usuário para comparação
  const cleanUserPhone = userPhone.replace(/\D/g, '');
  
  console.log('Comparando números:', { messagePhone, cleanUserPhone });
  
  return messagePhone === cleanUserPhone || messagePhone.endsWith(cleanUserPhone);
};
