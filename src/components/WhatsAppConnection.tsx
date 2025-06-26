
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export const WhatsAppConnection = () => {
  const { connection, loading, createConnection, disconnect } = useWhatsApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'waiting_qr': return 'bg-yellow-500';
      case 'creating': return 'bg-blue-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'waiting_qr': return 'Aguardando QR Code';
      case 'creating': return 'Criando conexão';
      case 'disconnected': return 'Desconectado';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'waiting_qr': return <QrCode className="h-4 w-4" />;
      case 'creating': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Conexão WhatsApp
        </CardTitle>
        <CardDescription>
          Conecte seu WhatsApp para enviar gastos e ganhos diretamente pelo celular
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connection && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(connection.status)} text-white`}>
              {getStatusIcon(connection.status)}
              {getStatusText(connection.status)}
            </Badge>
          </div>
        )}

        {connection?.status === 'waiting_qr' && connection.qrCode && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Escaneie o QR Code abaixo com seu WhatsApp:
            </p>
            <div className="flex justify-center">
              <img 
                src={`data:image/png;base64,${connection.qrCode}`}
                alt="QR Code WhatsApp"
                className="w-64 h-64 border-2 border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500">
              Abra o WhatsApp → Dispositivos conectados → Conectar um dispositivo
            </p>
          </div>
        )}

        {connection?.status === 'connected' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">WhatsApp conectado com sucesso!</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Agora você pode enviar seus gastos e ganhos diretamente pelo WhatsApp.
              Uma mensagem de boas-vindas foi enviada com as instruções.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!connection ? (
            <Button 
              onClick={createConnection}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Conectar WhatsApp
                </>
              )}
            </Button>
          ) : (
            <>
              {connection.status === 'connected' && (
                <Button 
                  onClick={disconnect}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Desconectando...
                    </>
                  ) : (
                    'Desconectar'
                  )}
                </Button>
              )}
              
              {connection.status === 'waiting_qr' && (
                <Button 
                  onClick={disconnect}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </>
          )}
        </div>

        {!connection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Clique em "Conectar WhatsApp"</li>
              <li>• Escaneie o QR Code com seu celular</li>
              <li>• Receba uma mensagem de boas-vindas</li>
              <li>• Comece a enviar seus gastos e ganhos!</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
