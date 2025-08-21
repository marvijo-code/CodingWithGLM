import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  const [apiKeyStatus, setApiKeyStatus] = useState(false);

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* API Key Input */}
      {showApiKeyInput && (
        <Card>
          <CardHeader>
            <CardTitle>OpenRouter API Key Required</CardTitle>
            <CardDescription>
              Enter your OpenRouter API key to use the speed test feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                Save Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speed Test Form */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Speed Test</CardTitle>
          <CardDescription>
            Compare the speed of different language models with the same prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Enter your prompt
            </label>
            <textarea
              id="prompt"
              placeholder="What is the meaning of life?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select models to test (max 3)</label>
            <div className="flex flex-wrap gap-2">
              {popularModels.map((model) => (
                <Badge
                  key={model}
                  variant={selectedModels.includes(model) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleModelSelection(model)}
                >
                  {model.split('/').pop()}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Run Button */}
          <Button
            onClick={handleRunTest}
            disabled={!prompt.trim() || selectedModels.length === 0 || isRunning || !apiKeyStatus}
            className="w-full"
          >
            {isRunning ? 'Running test...' : 'Run Speed Test'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Total time: {formatResponseTime(results.totalTime)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fastest Model Indicator */}
            {fastestModel && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🏆 Fastest: {fastestModel.model.split('/').pop()} ({formatResponseTime(fastestModel.responseTime)})
                </p>
              </div>
            )}

            {/* Model Results */}
            <div className="grid gap-4 md:grid-cols-3">
              {results.results.map((result) => (
                <Card key={result.model} className={result.model === fastestModel?.model ? 'border-green-500' : ''}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {result.model.split('/').pop()}
                      {result.model === fastestModel?.model && (
                        <span className="text-yellow-500">🏆</span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {formatResponseTime(result.responseTime)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.error ? (
                      <div className="text-sm text-red-500">
                        Error: {result.error}
                      </div>
                    ) : (
                      <div className="text-sm space-y-2">
                        <div className="max-h-40 overflow-y-auto text-muted-foreground">
                          {result.response?.choices?.[0]?.message?.content || 'No response'}
                        </div>
                        <Separator />
                        <div className="text-xs text-muted-foreground">
                          Tokens: {result.response?.usage?.total_tokens || 'N/A'}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}