import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trophy, Clock, Zap } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="relative inline-block">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            AI Model Speed Arena
          </h1>
          <div className="absolute -inset-x-4 -inset-y-2 bg-primary/10 blur-2xl rounded-full opacity-30" />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Benchmark the performance of cutting-edge AI models in real-time. 
          Compare response times, quality, and efficiency across multiple providers.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span>Real-time benchmarking</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Multiple providers</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Enterprise-grade</span>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to the Arena</CardTitle>
              <CardDescription className="text-base">
                Connect your OpenRouter API to unlock the full power of AI benchmarking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">API Key</label>
                <div className="flex space-x-2">
                  <Input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 font-mono bg-background/50 border-primary/20 focus:border-primary/40"
                  />
                  <Button 
                    onClick={handleSaveApiKey} 
                    disabled={!apiKey.trim()}
                    className="px-6"
                  >
                    Connect
                  </Button>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Your API key is encrypted and never stored permanently
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Speed Test Form */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-card/80 via-card/60 to-muted/20 backdrop-blur-sm">
        <CardHeader className="border-b border-border/20 pb-6">
          <CardTitle className="text-2xl flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full" />
            Configure Your Test
          </CardTitle>
          <CardDescription className="text-base">
            Craft the perfect prompt and select your AI gladiators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Prompt Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt" className="text-sm font-semibold text-foreground">
                Test Prompt
              </label>
              <span className="text-xs text-muted-foreground">
                {prompt.length}/1000
              </span>
            </div>
            <Textarea
              id="prompt"
              placeholder="Enter your test prompt... Try: 'Write a Python function to calculate fibonacci numbers with memoization'"
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              className="min-h-[140px] resize-none bg-background/50 border-border/20 focus:border-primary/40 rounded-xl text-base"
            />
            <p className="text-xs text-muted-foreground">
              💡 Pro tip: Use specific, technical prompts for more meaningful benchmarks
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Select AI Models</label>
              <Badge 
                variant={selectedModels.length === 3 ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {selectedModels.length}/3 selected
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularModels.map((model) => (
                <Button
                  key={model}
                  variant={selectedModels.includes(model) ? "default" : "ghost"}
                  size="lg"
                  className={`
                    justify-start text-left h-auto py-4 px-4 rounded-xl transition-all duration-200
                    ${selectedModels.includes(model) 
                      ? 'shadow-lg scale-[1.02] bg-primary/90 hover:bg-primary' 
                      : 'hover:bg-muted/50 hover:scale-[1.01] border border-border/20'
                    }
                  `}
                  onClick={() => toggleModelSelection(model)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      selectedModels.includes(model) ? 'bg-white' : 'bg-muted'
                    }`} />
                    <div>
                      <div className="font-mono text-sm font-medium">
                        {model.split('/').pop()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {model.split('/')[0]}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            {selectedModels.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Select up to 3 models to begin your benchmark
                </p>
              </div>
            )}
          </div>

          {/* Run Button */}
          <div className="pt-4">
            <Button
              onClick={handleRunTest}
              disabled={!prompt.trim() || selectedModels.length === 0 || isRunning || !apiKeyStatus}
              className={`
                w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300
                ${!isRunning && prompt.trim() && selectedModels.length > 0 && apiKeyStatus
                  ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : ''
                }
              `}
              size="lg"
            >
              {isRunning ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Benchmarking models...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Start Arena Battle</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Arena Results
            </h2>
            <p className="text-muted-foreground">
              Completed in {formatResponseTime(results.totalTime)}
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {results.results.map((result) => (
              <Card 
                key={result.model} 
                className={`
                  relative overflow-hidden transition-all duration-500
                  ${result.model === fastestModel?.model 
                    ? 'border-primary/50 shadow-2xl shadow-primary/20 scale-[1.02]' 
                    : 'border-border/20 hover:border-border/40'
                  }
                `}
              >
                {result.model === fastestModel?.model && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-primary/20 to-transparent h-20 w-20 rounded-bl-full" />
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        <span className="font-mono text-sm">
                          {result.model.split('/').pop()}
                        </span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono font-semibold">
                          {formatResponseTime(result.responseTime)}
                        </span>
                      </CardDescription>
                    </div>
                    {result.model === fastestModel?.model && (
                      <div className="relative">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <div className="absolute -inset-2 bg-yellow-500/20 blur-xl rounded-full" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {result.error ? (
                    <Alert variant="destructive" className="border-0 bg-destructive/10">
                      <AlertDescription className="text-sm font-medium">
                        {result.error}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-xl p-4">
                        <ScrollArea className="h-48">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-sm leading-relaxed">
                              {result.response?.choices?.[0]?.message?.content || 'No response generated'}
                            </p>
                          </div>
                        </ScrollArea>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-muted/20 rounded-lg p-3">
                          <div className="text-muted-foreground mb-1">Tokens</div>
                          <div className="font-mono font-semibold">
                            {result.response?.usage?.total_tokens || 0}
                          </div>
                        </div>
                        <div className="bg-muted/20 rounded-lg p-3">
                          <div className="text-muted-foreground mb-1">Status</div>
                          <div className="font-semibold text-green-500">
                            ✓ Complete
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}