import axios, { AxiosInstance } from 'axios';

export interface WahaSessionConfig {
  apiUrl: string;
  apiKey?: string;
}

export interface SessionInfo {
  name: string;
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED';
}

export class WahaSessionService {
  private client: AxiosInstance;

  constructor(config: WahaSessionConfig) {
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

  async createSession(sessionName: string): Promise<SessionInfo> {
    try {
      const response = await this.client.post('/api/sessions', {
        name: sessionName,
        start: true
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        return this.getSession(sessionName);
      }
      throw error;
    }
  }

  async getSession(sessionName: string): Promise<SessionInfo> {
    const response = await this.client.get(`/api/sessions/${sessionName}`);
    return response.data;
  }

  async startSession(sessionName: string): Promise<SessionInfo> {
    const response = await this.client.post(`/api/sessions/${sessionName}/start`);
    return response.data;
  }

  async stopSession(sessionName: string): Promise<void> {
    await this.client.post(`/api/sessions/${sessionName}/stop`);
  }

  async getQRCode(sessionName: string): Promise<string> {
    const response = await this.client.get(`/api/${sessionName}/auth/qr`, {
      params: { format: 'image' }
    });
    return response.data;
  }

  async listSessions(): Promise<SessionInfo[]> {
    const response = await this.client.get('/api/sessions');
    return response.data;
  }
}

export default WahaSessionService;
