import { DbService } from "./dbService.ts";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = "https://openrouter.ai/api/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateCompletion(
    request: OpenRouterRequest,
    modelDisplayName: string = request.model
  ): Promise<{ responseTime: number; response: OpenRouterResponse | null; error: string | null }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "http://localhost:5173", // Your app's URL
          "X-Title": "LLM Speed Test", // Your app's name
        },
        body: JSON.stringify(request),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          responseTime,
          response: null,
          error: `HTTP error! status: ${response.status}, message: ${errorText}`,
        };
      }

      const data: OpenRouterResponse = await response.json();
      
      // Store the result in the database
      const prompt = request.messages
        .filter(msg => msg.role === "user")
        .map(msg => msg.content)
        .join("\n");
      
      const responseText = data.choices[0]?.message?.content || "";
      
      DbService.createTestResult({
        prompt,
        provider: "OpenRouter",
        model: modelDisplayName,
        response_time: responseTime,
        response_text: responseText,
        status: "completed"
      });

      return {
        responseTime,
        response: data,
        error: null,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Store the error in the database
      const prompt = request.messages
        .filter(msg => msg.role === "user")
        .map(msg => msg.content)
        .join("\n");
      
      DbService.createTestResult({
        prompt,
        provider: "OpenRouter",
        model: modelDisplayName,
        response_time: responseTime,
        response_text: "",
        status: `error: ${errorMessage}`
      });

      return {
        responseTime,
        response: null,
        error: errorMessage,
      };
    }
  }

  async getModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }

  static async testConnection(apiKey: string): Promise<boolean> {
    try {
      const service = new OpenRouterService(apiKey);
      const models = await service.getModels();
      return models.length > 0;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }
}