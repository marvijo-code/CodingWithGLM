import { OpenRouterService } from "./openRouterService.ts";
import { DbService } from "./dbService.ts";

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

export class SpeedTestService {
  static async runSpeedTest(request: SpeedTestRequest): Promise<SpeedTestComparison> {
    const startTime = Date.now();
    const results: SpeedTestResult[] = [];

    // Get the API key from the database
    const apiKeyRecord = DbService.getApiKey("OPENROUTER_API_KEY", "OpenRouter");
    
    if (!apiKeyRecord) {
      throw new Error("OpenRouter API key not found");
    }

    const service = new OpenRouterService(apiKeyRecord.key_value);

    // Run all requests in parallel
    const promises = request.models.map(async (model) => {
      try {
        const openRouterRequest = {
          model,
          messages: [
            { role: "user", content: request.prompt },
          ],
          temperature: request.temperature || 0.7,
          max_tokens: request.max_tokens || 1000,
        };

        const result = await service.generateCompletion(openRouterRequest, model);
        
        return {
          model,
          responseTime: result.responseTime,
          response: result.response,
          error: result.error,
        };
      } catch (error) {
        return {
          model,
          responseTime: 0,
          response: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    // Wait for all requests to complete
    const testResults = await Promise.all(promises);
    results.push(...testResults);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Store the comparison results in the database
    for (const result of results) {
      DbService.createTestResult({
        prompt: request.prompt,
        provider: "OpenRouter",
        model: result.model,
        response_time: result.responseTime,
        response_text: result.response?.choices?.[0]?.message?.content || "",
        status: result.error ? `error: ${result.error}` : "completed"
      });
    }

    return {
      prompt: request.prompt,
      results,
      startTime,
      endTime,
      totalTime,
    };
  }

  static async getTestHistory(limit = 20): Promise<any[]> {
    return DbService.getTestResults(limit);
  }

  static async getAvailableModels(): Promise<any[]> {
    // Get the API key from the database
    const apiKeyRecord = DbService.getApiKey("OPENROUTER_API_KEY", "OpenRouter");
    
    if (!apiKeyRecord) {
      throw new Error("OpenRouter API key not found");
    }

    const service = new OpenRouterService(apiKeyRecord.key_value);
    return await service.getModels();
  }

  static async getPopularModels(): Promise<string[]> {
    try {
      const models = await this.getAvailableModels();
      
      // Filter for popular models (this is a simplified approach)
      const popularModelIds = [
        "z-ai/glm-4.5",
        "deepseek/deepseek-chat-v3.1",
        "moonshotai/kimi-k2",
        "qwen/qwen3-coder",
        "z-ai/glm-4.5-air"
      ];

      return popularModelIds.filter(modelId => 
        models.some(model => model.id === modelId)
      );
    } catch (error) {
      console.error("Error getting popular models:", error);
      return [];
    }
  }
}