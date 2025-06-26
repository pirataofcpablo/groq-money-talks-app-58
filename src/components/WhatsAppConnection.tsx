
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, CheckCircle, AlertCircle, Smartphone, RefreshCw } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export const WhatsAppConnection = () => {
  const { connection, loading, createConnection, disconnect, refreshQRCode } = useWhatsApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'waiting_qr': return 'bg-yellow-500';
      case 'creating': return 'bg-blue-500';
      case 'qr_expired': return 'bg-orange-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'waiting_qr': return 'Aguardando QR Code';
      case 'creating': return 'Criando conexão';
      case 'qr_expired': return 'QR Code expirado';
      case 'disconnected': return 'Desconectado';
      default: return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'waiting_qr': return <QrCode className="h-4 w-4" />;
      case 'creating': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'qr_expired': return <RefreshCw className="h-4 w-4" />;
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

        {(connection?.status === 'waiting_qr' || connection?.status === 'qr_expired') && connection.qrCode && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {connection.status === 'qr_expired' 
                ? '⚠️ QR Code expirado. Clique em "Renovar QR Code" para gerar um novo.'
                : 'Escaneie o QR Code abaixo com seu WhatsApp:'
              }
            </p>
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={`data:image/png;base64,${connection.qrCode}`}
                  alt="QR Code WhatsApp"
                  className={`w-64 h-64 border-2 rounded-lg ${
                    connection.status === 'qr_expired' 
                      ? 'border-orange-300 opacity-50' 
                      : 'border-gray-200'
                  }`}
                />
                {connection.status === 'qr_expired' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <span className="text-white font-medium">Expirado</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Abra o WhatsApp → Dispositivos conectados → Conectar um dispositivo
            </p>
            
            {connection.status === 'qr_expired' && (
              <Button 
                onClick={refreshQRCode}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Renovando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Renovar QR Code
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {connection?.status === 'connected' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">WhatsApp conectado com sucesso!</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              ✅ Assistente financeiro ativo! Mensagem de boas-vindas enviada com as instruções.
              Você já pode enviar seus gastos e ganhos diretamente pelo WhatsApp.
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
              
              {(connection.status === 'waiting_qr' || connection.status === 'qr_expired') && (
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
              <li>• Receba uma mensagem de boas-vindas automaticamente</li>
              <li>• Comece a enviar seus gastos e ganhos imediatamente!</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
