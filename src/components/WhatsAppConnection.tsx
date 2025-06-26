import { useState } from 'react';
import { evolutionApi } from '@/services/EvolutionApiService';

export const useWhatsApp = () => {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const instanceName = 'financial_' + localStorage.getItem('userPhone') || 'default_user';

  const createConnection = async () => {
    setLoading(true);
    try {
      setConnection({ status: 'creating' });

      // Cria instância se não existir
      await evolutionApi.createInstance(instanceName);

      // Conecta a instância
      await evolutionApi.makeRequest(`/instance/connect/${instanceName}`, 'GET');

      // Espera a API preparar o QR code
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Busca o QR Code
      const qr = await evolutionApi.getQRCode(instanceName);

      setConnection({
        status: 'waiting_qr',
        qrCode: qr.base64
      });

    } catch (err) {
      console.error('Erro ao criar conexão:', err);
      alert('Erro ao conectar WhatsApp. Detalhes: ' + err.message);
      setConnection(null);
    }
    setLoading(false);
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await evolutionApi.deleteInstance(instanceName);
      setConnection(null);
    } catch (err) {
      console.error('Erro ao desconectar:', err);
    }
    setLoading(false);
  };

  const refreshQRCode = async () => {
    setLoading(true);
    try {
      const qr = await evolutionApi.getQRCode(instanceName);
      setConnection({
        status: 'waiting_qr',
        qrCode: qr.base64
      });
    } catch (err) {
      alert('Erro ao renovar QR Code');
    }
    setLoading(false);
  };

  return {
    connection,
    loading,
    createConnection,
    disconnect,
    refreshQRCode
  };
};
