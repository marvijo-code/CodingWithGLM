import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  Zap, 
  Trophy, 
  Clock, 
  Cpu, 
  Settings, 
  Play, 
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp
} from 'lucide-react';
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


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Performance Benchmarking
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            LLM Speed Arena
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Compare AI model performance in real-time. Benchmark response times, quality, and efficiency across multiple providers with enterprise-grade precision.
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time Testing</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Multi-Provider</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Enterprise Ready</span>
          </div>
        </div>
      </div>

      {/* API Key Setup */}
      {showApiKeyInput && (
        <div className="mx-auto max-w-md">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>
                Connect your OpenRouter API key to unlock AI model benchmarking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  OpenRouter API Key
                </label>
                <Input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={handleSaveApiKey} 
                disabled={!apiKey.trim()}
                className="w-full"
                size="lg"
              >
                <Zap className="mr-2 h-4 w-4" />
                Connect & Start Testing
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Your API key is securely stored locally and never shared.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Interface */}
      {!showApiKeyInput && (
        <div className="mx-auto max-w-4xl space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>Configure Benchmark</span>
              </CardTitle>
              <CardDescription>
                Design your test prompt and select AI models for performance comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Test Prompt
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {prompt.length}/2000 characters
                  </Badge>
                </div>
                <Textarea
                  placeholder="Enter a detailed prompt to benchmark AI models. Example: 'Write a Python function to implement a binary search algorithm with error handling and documentation.'"
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Use specific, technical prompts for more meaningful performance comparisons
                </p>
              </div>

              <Separator />

              {/* Model Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none">
                    AI Models
                  </label>
                  <Badge variant={selectedModels.length > 0 ? "default" : "secondary"}>
                    {selectedModels.length}/3 selected
                  </Badge>
                </div>
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {popularModels.map((model) => {
                    const isSelected = selectedModels.includes(model);
                    const [provider, modelName] = model.split('/');
                    
                    return (
                      <Card 
                        key={model}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleModelSelection(model)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {modelName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {provider}
                              </p>
                            </div>
                            <div className={`h-4 w-4 rounded-full border-2 ${
                              isSelected 
                                ? 'bg-primary border-primary' 
                                : 'border-muted-foreground/25'
                            }`}>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {selectedModels.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Select at least one AI model to begin benchmarking.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Action Button */}
              <Button
                onClick={handleRunTest}
                disabled={!prompt.trim() || selectedModels.length === 0 || isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Benchmarking Models...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Performance Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          
          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Benchmark Results</span>
                  </CardTitle>
                  <CardDescription>
                    Performance comparison completed in {formatResponseTime(results.totalTime)}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-6 lg:grid-cols-1">
                {results.results
                  .sort((a, b) => a.responseTime - b.responseTime)
                  .map((result, index) => {
                    const isWinner = index === 0 && !result.error;
                    const [provider, modelName] = result.model.split('/');
                    
                    return (
                      <Card 
                        key={result.model} 
                        className={`relative overflow-hidden transition-all ${
                          isWinner 
                            ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' 
                            : ''
                        }`}
                      >
                        {isWinner && (
                          <div className="absolute right-4 top-4">
                            <Badge className="bg-yellow-500 text-yellow-50">
                              <Trophy className="mr-1 h-3 w-3" />
                              Winner
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{modelName}</CardTitle>
                              <CardDescription className="flex items-center space-x-4 mt-1">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-mono font-medium">
                                    {formatResponseTime(result.responseTime)}
                                  </span>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {provider}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {result.error ? (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{result.error}</AlertDescription>
                            </Alert>
                          ) : (
                            <div className="space-y-4">
                              <ScrollArea className="h-32 w-full rounded-md border p-3">
                                <div className="text-sm leading-relaxed">
                                  {result.response?.choices?.[0]?.message?.content || 'No response generated'}
                                </div>
                              </ScrollArea>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  <span>Tokens: {result.response?.usage?.total_tokens || 0}</span>
                                  <span>Rank: #{index + 1}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Complete
                                </Badge>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}