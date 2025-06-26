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
    message?: {
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
      webhookByEvents: false,
    };

    return this.makeRequest('/instance/create', 'POST', data);
  }

  async getQRCode(instanceName: string): Promise<QRCodeResponse> {
    console.log('Getting QR code for instance:', instanceName);

    try {
      // Tentar conectar
      await this.makeRequest(`/instance/connect/${instanceName}`, 'GET');
    } catch (error: any) {
      if (error.message.includes('404')) {
        console.warn(`Instância "${instanceName}" não encontrada. Criando nova...`);
        await this.createInstance(instanceName);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const qrResponse = await this.makeRequest(`/instance/qrcode/${instanceName}`, 'GET');
      if (qrResponse.base64) {
        return {
          base64: qrResponse.base64,
          code: qrResponse.code || 'QR_CODE_GENERATED',
        };
      }
    } catch (qrError) {
      console.error('Erro ao buscar QR Code:', qrError);
      throw qrError;
    }

    throw new Error('QR Code não foi gerado');
  }

  async getInstanceStatus(instanceName: string): Promise<{ instance: { state: string } }> {
    return this.makeRequest(`/instance/connectionState/${instanceName}`);
  }

  async sendMessage(instanceName: string, number: string, message: string) {
    const formattedNumber = number.replace(/\D/g, '');
    const data = {
      number: `${formattedNumber}@s.whatsapp.net`,
      textMessage: {
        text: message,
      },
    };
    return this.makeRequest(`/message/sendText/${instanceName}`, 'POST', data);
  }

  async setWebhook(instanceName: string, webhookUrl: string) {
    const data = {
      url: webhookUrl,
      webhook_by_events: false,
      events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
    };
    return this.makeRequest(`/webhook/set/${instanceName}`, 'POST', data);
  }

  async deleteInstance(instanceName: string) {
    return this.makeRequest(`/instance/delete/${instanceName}`, 'DELETE');
  }

  async restartInstance(instanceName: string) {
    return this.makeRequest(`/instance/restart/${instanceName}`, 'POST');
  }

  // ✅ Novo método: trata eventos de conexão e envia mensagem automática
  async handleConnectionUpdate(event: WebhookEvent) {
    if (
      event.event === 'CONNECTION_UPDATE' &&
      event.data &&
      event.data.key &&
      !event.data.key.fromMe
    ) {
      const instance = event.instance;
      const user = event.data.key.remoteJid.replace(/@s\.whatsapp\.net$/, '');

      const mensagemBoasVindas = `👋 Olá! Você está conectado ao *Controle Financeiro Elite*.

📲 Me envie mensagens como:
- "gastei 20 com lanche"
- "ganhei 50 do X salgado"
- "despesa do dia"
- "lucro do dia"

E eu organizo tudo pra você 💸📊`;

      await this.sendMessage(instance, user, mensagemBoasVindas);
    }
  }
}

export const evolutionApi = new EvolutionApiService();
