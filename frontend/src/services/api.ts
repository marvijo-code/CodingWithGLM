const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SpeedTestRequest {
  prompt: string;
  models: string[];
  temperature?: number;
  max_tokens?: number;
}

export interface SpeedTestResult {
  model: string;
  responseTime: number;
  response: any;
  error: string | null;
}

export interface SpeedTestComparison {
  prompt: string;
  results: SpeedTestResult[];
  startTime: number;
  endTime: number;
  totalTime: number;
}

export interface TestResult {
  id?: number;
  prompt: string;
  provider: string;
  model: string;
  response_time: number;
  response_text?: string;
  status: string;
  created_at?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // OpenRouter API endpoints
  async getModels() {
    return this.request('/api/openrouter/models');
  }

  async testConnection(apiKey: string) {
    return this.request('/api/openrouter/test-connection', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
  }

  async generateCompletion(prompt: string, model: string, temperature = 0.7, maxTokens = 1000) {
    return this.request('/api/openrouter/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        model,
        temperature,
        max_tokens: maxTokens,
      }),
    });
  }

  async saveApiKey(apiKey: string) {
    return this.request('/api/openrouter/api-key', {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
  }

  async getApiKeyStatus() {
    return this.request('/api/openrouter/api-key/status');
  }

  // Speed test endpoints
  async runSpeedTest(request: SpeedTestRequest) {
    return this.request<SpeedTestComparison>('/api/speed-test/run', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getTestHistory(limit = 20) {
    return this.request<TestResult[]>('/api/speed-test/history', {
      method: 'GET',
    });
  }

  async getAvailableModels() {
    return this.request('/api/speed-test/models');
  }

  async getPopularModels() {
    return this.request('/api/speed-test/popular-models');
  }

  // Test results endpoint
  async getTestResults(limit = 50) {
    return this.request<TestResult[]>(`/api/test-results?limit=${limit}`);
  }
}

export const apiService = new ApiService();