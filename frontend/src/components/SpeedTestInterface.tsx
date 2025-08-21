import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Zap } from 'lucide-react';
import { apiService } from '@/services/api';
import type { SpeedTestComparison } from '@/services/api';

interface ApiKeyStatusResponse {
  hasApiKey: boolean;
}

export function SpeedTestInterface() {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [popularModels, setPopularModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SpeedTestComparison | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [, setApiKeyStatus] = useState(false);

  useEffect(() => {
    // Check API key status
    const checkApiKeyStatus = async () => {
      try {
        const response = await apiService.getApiKeyStatus();
        if (response.success && response.data) {
          const data = response.data as ApiKeyStatusResponse;
          setApiKeyStatus(data.hasApiKey);
          setShowApiKeyInput(!data.hasApiKey);
        }
      } catch (error) {
        console.error('Error checking API key status:', error);
        setShowApiKeyInput(true);
      }
    };

    // Load popular models
    const loadPopularModels = async () => {
      try {
        const response = await apiService.getPopularModels();
        if (response.success && response.data) {
          const models = response.data as string[];
          setPopularModels(models);
          setSelectedModels(models.slice(0, 3)); // Select first 3 by default
        }
      } catch (error) {
        console.error('Error loading popular models:', error);
      }
    };

    checkApiKeyStatus();
    loadPopularModels();
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    
    try {
      const response = await apiService.saveApiKey(apiKey);
      if (response.success) {
        setApiKeyStatus(true);
        setShowApiKeyInput(false);
        setApiKey('');
      } else {
        console.error('Error saving API key:', response.error);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  const handleRunTest = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;
    
    setIsRunning(true);
    setResults(null);
    
    try {
      const response = await apiService.runSpeedTest({
        prompt,
        models: selectedModels,
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        console.error('Error running speed test:', response.error);
      }
    } catch (error) {
      console.error('Error running speed test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        if (prev.length >= 3) {
          return prev; // Limit to 3 models
        }
        return [...prev, modelId];
      }
    });
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };

  const getFastestModel = () => {
    if (!results || results.results.length === 0) return null;
    
    const validResults = results.results.filter(r => !r.error);
    if (validResults.length === 0) return null;
    
    return validResults.reduce((fastest, current) => 
      current.responseTime < fastest.responseTime ? current : fastest
    );
  };

  const fastestModel = getFastestModel();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to LLM Speed Test
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your OpenRouter API to start benchmarking AI models
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  API Key
                </label>
                <Input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md"
                />
              </div>
              <Button 
                onClick={handleSaveApiKey} 
                disabled={!apiKey.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Connect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Speed Test Form */}
      {!showApiKeyInput && (
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Message
                </label>
                <Textarea
                  placeholder="Enter your prompt to test AI model performance..."
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded-md text-base"
                />
              </div>

              {/* Model Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Select Models (up to 3)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {popularModels.map((model) => (
                    <button
                      key={model}
                      type="button"
                      className={`
                        p-3 text-left rounded-md border transition-colors
                        ${selectedModels.includes(model)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                      onClick={() => toggleModelSelection(model)}
                    >
                      <div className="font-medium text-sm">{model.split('/').pop()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{model.split('/')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleRunTest}
                disabled={!prompt.trim() || selectedModels.length === 0 || isRunning}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md"
              >
                {isRunning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running test...</span>
                  </div>
                ) : (
                  <span>Run Speed Test</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="w-full max-w-3xl mx-auto space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Results
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completed in {formatResponseTime(results.totalTime)}
            </p>
          </div>
          
          <div className="space-y-4">
            {results.results.map((result) => (
              <div key={result.model} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {result.model.split('/').pop()}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatResponseTime(result.responseTime)}
                        {result.model === fastestModel?.model && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                            🏆 Fastest
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {result.error ? (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {result.error}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {result.response?.choices?.[0]?.message?.content || 'No response generated'}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Tokens: {result.response?.usage?.total_tokens || 0}</span>
                        <span className="text-green-600 dark:text-green-400">✓ Complete</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  )
    </div>
  );
}