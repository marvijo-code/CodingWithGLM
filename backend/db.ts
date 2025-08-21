// Simple in-memory database for development
interface ApiKey {
  id: number;
  provider: string;
  key_name: string;
  key_value: string;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  id: number;
  prompt: string;
  provider: string;
  model: string;
  response_time: number;
  response_text?: string;
  status: string;
  created_at: string;
}

interface Provider {
  id: number;
  name: string;
  base_url: string;
  is_active: boolean;
  created_at: string;
}

// In-memory storage
let apiKeys: ApiKey[] = [];
let testResults: TestResult[] = [];
let providers: Provider[] = [
  {
    id: 1,
    name: 'OpenRouter',
    base_url: 'https://openrouter.ai/api/v1',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

let nextId = 1;

// Database interface
class InMemoryDB {
  private query<T>(sql: string, params: any[] = []): T[] {
    // This is a very simple query implementation
    // In a real implementation, you would parse the SQL and execute it properly
    if (sql.includes('INSERT INTO api_keys')) {
      const newApiKey: ApiKey = {
        id: nextId++,
        provider: params[0],
        key_name: params[1],
        key_value: params[2],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      apiKeys.push(newApiKey);
      return [newApiKey] as T[];
    }
    
    if (sql.includes('SELECT * FROM api_keys')) {
      if (params.length > 0) {
        // Filter by provider and key_name
        return apiKeys.filter(key =>
          key.provider === params[1] && key.key_name === params[0]
        ) as T[];
      }
      return apiKeys as T[];
    }
    
    if (sql.includes('INSERT INTO test_results')) {
      const newTestResult: TestResult = {
        id: nextId++,
        prompt: params[0],
        provider: params[1],
        model: params[2],
        response_time: params[3],
        response_text: params[4],
        status: params[5],
        created_at: new Date().toISOString()
      };
      testResults.push(newTestResult);
      return [newTestResult] as T[];
    }
    
    if (sql.includes('SELECT * FROM test_results')) {
      return testResults.slice(0, params[0] || 50) as T[];
    }
    
    if (sql.includes('SELECT * FROM providers')) {
      return providers as T[];
    }
    
    return [];
  }
  
  private execute(sql: string, params: any[] = []): any {
    if (sql.includes('CREATE TABLE')) {
      // Tables are already created in memory
      return { lastInsertRowId: 0 };
    }
    
    if (sql.includes('INSERT OR IGNORE INTO providers')) {
      // Provider already exists
      return { lastInsertRowId: 0 };
    }
    
    return this.query(sql, params);
  }
  
  query = this.query;
  execute = this.execute;
}

const db = new InMemoryDB();
export default db;