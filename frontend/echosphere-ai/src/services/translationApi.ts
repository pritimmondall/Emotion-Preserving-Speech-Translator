// Translation API service for text translation

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  emotion?: string;
  intensity?: number;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

class TranslationApiService {
  private baseUrl: string;

  constructor() {
    const backendHost = import.meta.env.VITE_BACKEND_HOST || 'localhost';
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '8000';
    this.baseUrl = `http://${backendHost}:${backendPort}`;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const response = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const translationApi = new TranslationApiService();
export default translationApi;
