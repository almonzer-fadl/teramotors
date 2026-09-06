import axios, { AxiosInstance } from 'axios';

export interface WahaConfig {
  apiUrl: string;
  apiKey?: string;
  sessionName: string;
}

export interface WahaMessageResponse {
  id: string | { id: string; _serialized: string };
  timestamp?: number;
  [key: string]: any;
}

export class WahaService {
  private client: AxiosInstance;
  private config: WahaConfig;

  constructor(config: WahaConfig) {
    this.config = config;

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(config.apiKey ? { 'X-Api-Key': config.apiKey } : {})
      }
    });
  }

  /**
   * Format phone number to WhatsApp chat ID format
   * +966553022102 → 966553022102@c.us
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    return `${cleanPhone}@c.us`;
  }

  /**
   * Extract message ID from Waha response
   */
  extractMessageId(response: WahaMessageResponse): string {
    if (typeof response.id === 'string') {
      return response.id;
    }
    if (typeof response.id === 'object') {
      return response.id._serialized || response.id.id || JSON.stringify(response.id);
    }
    return `waha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send text message via Waha
   */
  async sendTextMessage(chatId: string, text: string): Promise<WahaMessageResponse> {
    try {
      const payload = {
        session: this.config.sessionName,
        chatId,
        text
      };

      const response = await this.client.post('/api/sendText', payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if Waha is connected
   */
  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/sessions');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default WahaService;
