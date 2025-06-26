
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, CheckCircle, AlertCircle, Smartphone, RefreshCw, Clock } from 'lucide-react';
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
            {connection.status === 'waiting_qr' && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                QR atualiza a cada 60s
              </div>
            )}
          </div>
        )}

        {connection?.status === 'waiting_qr' && connection.qrCode && (
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                📱 Escaneie o QR Code com seu WhatsApp
              </p>
              <p className="text-xs text-blue-600 mt-1">
                O código é atualizado automaticamente a cada 60 segundos
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={`data:image/png;base64,${connection.qrCode}`}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 border-2 border-gray-200 rounded-lg shadow-lg"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                  <QrCode className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 text-center">
                💡 <strong>Como escanear:</strong><br />
                Abra o WhatsApp → Toque nos 3 pontos → Dispositivos conectados → Conectar um dispositivo
              </p>
            </div>
          </div>
        )}

        {connection?.status === 'qr_expired' && (
          <div className="text-center space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-orange-800 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">QR Code Expirado</span>
              </div>
              <p className="text-sm text-orange-700">
                O QR Code expirou. Clique em "Renovar QR Code" para gerar um novo.
              </p>
            </div>
            
            <Button 
              onClick={refreshQRCode}
              disabled={loading}
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
          </div>
        )}

        {connection?.status === 'connected' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">WhatsApp Conectado com Sucesso!</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>✅ Mensagem de boas-vindas enviada automaticamente</p>
              <p>🤖 Assistente financeiro ativo e pronto para uso</p>
              <p>💬 Você já pode enviar seus gastos e ganhos pelo WhatsApp</p>
            </div>
          </div>
        )}

        {connection?.status === 'creating' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">Criando conexão WhatsApp...</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Aguarde enquanto preparamos sua conexão. O QR Code aparecerá em breve.
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
                    'Desconectar WhatsApp'
                  )}
                </Button>
              )}
              
              {(connection.status === 'waiting_qr' || connection.status === 'creating') && (
                <Button 
                  onClick={disconnect}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar Conexão
                </Button>
              )}
              
              {connection.status === 'qr_expired' && (
                <div className="flex gap-2 flex-1">
                  <Button 
                    onClick={refreshQRCode}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Renovando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renovar QR Code
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={disconnect}
                    disabled={loading}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {!connection && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📋 Como funciona:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Clique em "Conectar WhatsApp"</li>
              <li>• Escaneie o QR Code com seu celular</li>
              <li>• Receba mensagem de boas-vindas automaticamente</li>
              <li>• Comece a enviar gastos e ganhos imediatamente!</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
              <strong>💡 Dica:</strong> O QR Code é atualizado automaticamente a cada 60 segundos para maior segurança.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
