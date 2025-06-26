
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processMessage } from '@/utils/messageProcessor';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface WhatsAppSimulatorProps {
  transactions: any[];
  onAddTransaction: (transaction: any) => void;
}

export const WhatsAppSimulator = ({ transactions, onAddTransaction }: WhatsAppSimulatorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente financeiro. Envie mensagens como:\n• "gastei 20 com marmita"\n• "ganhei 50 do freelance"\n• "despesa do dia"\n• "lucro do dia"',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Processar mensagem
    const response = await processMessage(inputMessage, transactions, onAddTransaction);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputMessage('');
    toast.success('Mensagem enviada!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
          Assistente Financeiro WhatsApp
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              className="bg-green-500 hover:bg-green-600"
            >
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
