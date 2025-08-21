// Simple in-memory database with basic persistence
interface DatabaseRow {
  [key: string]: any;
}

class InMemoryDB {
  private apiKeys: any[] = [];
  private testResults: any[] = [];
  private providers: any[] = [
    {
      id: 1,
      name: "OpenRouter",
      base_url: "https://openrouter.ai/api/v1",
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];
  private nextId = {
    apiKeys: 1,
    testResults: 1,
    providers: 2
  };

  constructor() {
    this.init();
  }

  private init() {
    // Initialize with API key from environment or .env file
    if (this.apiKeys.length === 0) {
      let apiKey = this.loadApiKeyFromEnv();
      
      this.apiKeys.push({
        id: this.nextId.apiKeys++,
        provider: "OpenRouter",
        key_name: "OPENROUTER_API_KEY",
        key_value: apiKey,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }

  private loadApiKeyFromEnv(): string {
    let apiKey = "";
    
    try {
      // Try to load from .env file first
      const envPaths = ['.env.local', '.env'];
      
      for (const envPath of envPaths) {
        try {
          let envContent: string | null = null;
          
          // Deno environment
          if (typeof (globalThis as any).Deno !== 'undefined') {
            try {
              // @ts-ignore
              envContent = (globalThis as any).Deno.readTextFileSync(envPath) as string;
            } catch {
              continue; // File doesn't exist
            }
          } else {
            // Node.js environment
            try {
              const fs = (globalThis as any).require?.('fs');
              if (fs && fs.existsSync && fs.readFileSync) {
                if (fs.existsSync(envPath)) {
                  envContent = fs.readFileSync(envPath, 'utf8') as string;
                }
              }
            } catch {
              continue; // File doesn't exist or fs not available
            }
          }
          
          if (envContent) {
            const lines = envContent.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('OPENROUTER_API_KEY=')) {
                const value = trimmed.substring('OPENROUTER_API_KEY='.length);
                return value.trim().replace(/^["']|["']$/g, '');
              }
            }
          }
        } catch {
          // Continue to next file
        }
      }
      
      // Fallback to environment variables
      if (typeof (globalThis as any).Deno !== 'undefined') {
        apiKey = (globalThis as any).Deno.env.get("OPENROUTER_API_KEY") || "";
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
        apiKey = (globalThis as any).process.env.OPENROUTER_API_KEY || "";
      }
    } catch {
      // Final fallback
      apiKey = "";
    }
    
    return apiKey;
  }

  query<T>(sql: string, params: any[] = []): T[] {
    // Simple query simulation
    if (sql.includes("SELECT * FROM api_keys")) {
      if (params.length > 0) {
        // WHERE clause
        const [keyName, provider] = params;
        return this.apiKeys.filter(k => k.key_name === keyName && k.provider === provider) as T[];
      }
      return [...this.apiKeys] as T[];
    }
    
    if (sql.includes("SELECT * FROM test_results")) {
      const limit = params[0] || 50;
      return [...this.testResults].reverse().slice(0, limit) as T[];
    }
    
    if (sql.includes("SELECT * FROM providers")) {
      return [...this.providers] as T[];
    }

    if (sql.includes("SELECT * FROM providers WHERE name = ?")) {
      const name = params[0];
      return this.providers.filter(p => p.name === name) as T[];
    }
    
    return [];
  }

  execute(sql: string, params: any[] = []): { lastInsertRowId: number; changes: number } {
    // Simple execute simulation
    if (sql.includes("INSERT INTO api_keys")) {
      const [provider, keyName, keyValue] = params;
      const newKey = {
        id: this.nextId.apiKeys++,
        provider,
        key_name: keyName,
        key_value: keyValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.apiKeys.push(newKey);
      return { lastInsertRowId: newKey.id, changes: 1 };
    }

    if (sql.includes("INSERT INTO test_results")) {
      const [prompt, provider, model, responseTime, responseText, status] = params;
      const newResult = {
        id: this.nextId.testResults++,
        prompt,
        provider,
        model,
        response_time: responseTime,
        response_text: responseText,
        status,
        created_at: new Date().toISOString()
      };
      this.testResults.push(newResult);
      return { lastInsertRowId: newResult.id, changes: 1 };
    }

    if (sql.includes("UPDATE api_keys")) {
      const id = params[params.length - 1];
      const keyIndex = this.apiKeys.findIndex(k => k.id === id);
      
      if (keyIndex !== -1) {
        if (params.length > 1) {
          this.apiKeys[keyIndex].key_value = params[0];
          this.apiKeys[keyIndex].updated_at = new Date().toISOString();
        }
        return { lastInsertRowId: id, changes: 1 };
      }
    }

    if (sql.includes("DELETE FROM api_keys")) {
      const id = params[0];
      const originalLength = this.apiKeys.length;
      this.apiKeys = this.apiKeys.filter(k => k.id !== id);
      return { lastInsertRowId: 0, changes: originalLength - this.apiKeys.length };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  deleteApiKey(keyName: string, provider: string): boolean {
    const initialLength = this.apiKeys.length;
    this.apiKeys = this.apiKeys.filter(k => !(k.key_name === keyName && k.provider === provider));
    return this.apiKeys.length < initialLength;
  }

  // Method to reload API keys from environment
  reloadApiKeysFromEnv(): void {
    const newApiKey = this.loadApiKeyFromEnv();
    if (newApiKey) {
      this.updateApiKey("OPENROUTER_API_KEY", newApiKey, "OpenRouter");
    }
  }

  updateApiKey(keyName: string, keyValue: string, provider: string): void {
    const keyIndex = this.apiKeys.findIndex(k => k.key_name === keyName && k.provider === provider);
    if (keyIndex !== -1) {
      this.apiKeys[keyIndex].key_value = keyValue;
      this.apiKeys[keyIndex].updated_at = new Date().toISOString();
    }
  }
}

const db = new InMemoryDB();

export default db;