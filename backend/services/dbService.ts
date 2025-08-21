import db from "../db.ts";

export interface ApiKey {
  id?: number;
  provider: string;
  key_name: string;
  key_value: string;
  created_at?: string;
  updated_at?: string;
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

export interface Provider {
  id?: number;
  name: string;
  base_url: string;
  is_active: boolean;
  created_at?: string;
}

export class DbService {
  // API Key operations
  static getApiKeys(provider?: string): ApiKey[] {
    let query = "SELECT * FROM api_keys";
    const params: any[] = [];
    
    if (provider) {
      query += " WHERE provider = ?";
      params.push(provider);
    }
    
    return db.query(query, [...params]).map((row: any) => ({
      id: row[0],
      provider: row[1],
      key_name: row[2],
      key_value: row[3],
      created_at: row[4],
      updated_at: row[5]
    }));
  }

  static getApiKey(keyName: string, provider: string): ApiKey | undefined {
    const result = db.query("SELECT * FROM api_keys WHERE key_name = ? AND provider = ?", [keyName, provider]);
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      id: row[0],
      provider: row[1],
      key_name: row[2],
      key_value: row[3],
      created_at: row[4],
      updated_at: row[5]
    };
  }

  static createApiKey(apiKey: Omit<ApiKey, "id" | "created_at" | "updated_at">): number {
    const result = db.query(
      "INSERT INTO api_keys (provider, key_name, key_value) VALUES (?, ?, ?)",
      [apiKey.provider, apiKey.key_name, apiKey.key_value]
    );
    return result.lastInsertRowId ?? 0;
  }

  static updateApiKey(id: number, apiKey: Partial<ApiKey>): void {
    const fields = [];
    const params = [];
    
    if (apiKey.key_value !== undefined) {
      fields.push("key_value = ?");
      params.push(apiKey.key_value);
    }
    
    if (fields.length === 0) return;
    
    params.push(id);
    db.query(`UPDATE api_keys SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
  }

  static deleteApiKey(id: number): void {
    db.query("DELETE FROM api_keys WHERE id = ?", [id]);
  }

  // Test result operations
  static getTestResults(limit = 50): TestResult[] {
    const results = db.query("SELECT * FROM test_results ORDER BY created_at DESC LIMIT ?", [limit]);
    return results.map((row: any) => ({
      id: row[0],
      prompt: row[1],
      provider: row[2],
      model: row[3],
      response_time: row[4],
      response_text: row[5],
      status: row[6],
      created_at: row[7]
    }));
  }

  static createTestResult(testResult: Omit<TestResult, "id" | "created_at">): number {
    const result = db.query(
      "INSERT INTO test_results (prompt, provider, model, response_time, response_text, status) VALUES (?, ?, ?, ?, ?, ?)",
      [testResult.prompt, testResult.provider, testResult.model, testResult.response_time, testResult.response_text, testResult.status]
    );
    return result.lastInsertRowId ?? 0;
  }

  // Provider operations
  static getProviders(): Provider[] {
    const results = db.query("SELECT * FROM providers");
    return results.map((row: any) => ({
      id: row[0],
      name: row[1],
      base_url: row[2],
      is_active: Boolean(row[3]),
      created_at: row[4]
    }));
  }

  static getProvider(name: string): Provider | undefined {
    const result = db.query("SELECT * FROM providers WHERE name = ?", [name]);
    if (result.length === 0) return undefined;
    
    const row = result[0];
    return {
      id: row[0],
      name: row[1],
      base_url: row[2],
      is_active: Boolean(row[3]),
      created_at: row[4]
    };
  }

  static createProvider(provider: Omit<Provider, "id" | "created_at">): number {
    const result = db.query(
      "INSERT INTO providers (name, base_url, is_active) VALUES (?, ?, ?)",
      [provider.name, provider.base_url, provider.is_active ? 1 : 0]
    );
    return result.lastInsertRowId ?? 0;
  }
}