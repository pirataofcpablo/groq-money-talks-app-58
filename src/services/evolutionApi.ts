
const EVOLUTION_API_URL = 'https://v2.solucoesweb.uk';
const API_KEY = 'cc2ad6931f7c17a9e98d10127c43dfbf';

export interface EvolutionInstance {
  instanceName: string;
  status: string;
}

export interface QRCodeResponse {
  base64: string;
  code: string;
}

export interface WebhookEvent {
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

export class EvolutionApiService {
  private baseUrl = EVOLUTION_API_URL;
  private apiKey = API_KEY;

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    console.log(`Making ${method} request to:`, url);
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Evolution API error (${response.status}):`, errorText);
      throw new Error(`Evolution API error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }

  async createInstance(instanceName: string): Promise<EvolutionInstance> {
    console.log('Creating instance:', instanceName);
    
    const data = {
      instanceName,
      token: this.apiKey,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
      webhookEvents: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
      webhookByEvents: false
    };

    return this.makeRequest('/instance/create', 'POST', data);
  }

  async getQRCode(instanceName: string): Promise<QRCodeResponse> {
    console.log('Getting QR code for instance:', instanceName);
    
    try {
      // Primeiro, conectar à instância
      const connectResponse = await this.makeRequest(`/instance/connect/${instanceName}`, 'GET');
      console.log('Connect response:', connectResponse);
      
      // Aguardar um pouco para a geração do QR Code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Buscar o QR Code
      const qrResponse = await this.makeRequest(`/instance/qrcode/${instanceName}`, 'GET');
      console.log('QR Code response:', qrResponse);
      
      if (qrResponse.base64) {
        return {
          base64: qrResponse.base64,
          code: qrResponse.code || 'QR_CODE_GENERATED'
        };
      }
      
      // Se não tiver base64, tentar o endpoint de conexão
      const fallbackResponse = await this.makeRequest(`/instance/connect/${instanceName}`, 'GET');
      if (fallbackResponse.base64) {
        return {
          base64: fallbackResponse.base64,
          code: fallbackResponse.code || 'QR_CODE_GENERATED'
        };
      }
      
      throw new Error('QR Code não foi gerado');
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      throw error;
    }
  }

  async getInstanceStatus(instanceName: string): Promise<{ instance: { state: string } }> {
    console.log('Getting instance status:', instanceName);
    return this.makeRequest(`/instance/connectionState/${instanceName}`);
  }

  async sendMessage(instanceName: string, number: string, message: string) {
    console.log('Sending message to:', number);
    
    // Garantir que o número está no formato correto
    const formattedNumber = number.replace(/\D/g, '');
    
    const data = {
      number: `${formattedNumber}@s.whatsapp.net`,
      textMessage: {
        text: message
      }
    };

    return this.makeRequest(`/message/sendText/${instanceName}`, 'POST', data);
  }

  async setWebhook(instanceName: string, webhookUrl: string) {
    console.log('Setting webhook for instance:', instanceName);
    
    const data = {
      url: webhookUrl,
      webhook_by_events: false,
      events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
    };

    return this.makeRequest(`/webhook/set/${instanceName}`, 'POST', data);
  }

  async deleteInstance(instanceName: string) {
    console.log('Deleting instance:', instanceName);
    return this.makeRequest(`/instance/delete/${instanceName}`, 'DELETE');
  }

  async restartInstance(instanceName: string) {
    console.log('Restarting instance:', instanceName);
    return this.makeRequest(`/instance/restart/${instanceName}`, 'POST');
  }
}

export const evolutionApi = new EvolutionApiService();
