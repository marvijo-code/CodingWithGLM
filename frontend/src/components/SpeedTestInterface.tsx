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

// Common test prompts for random selection
const SAMPLE_PROMPTS = [
  "Write a Python function to implement a binary search algorithm with error handling and comprehensive documentation.",
  "Explain the concept of recursion and provide a practical example with a recursive function to calculate factorial.",
  "Create a REST API endpoint in Node.js that handles user authentication with JWT tokens and proper error handling.",
  "Write a React component that fetches data from an API and displays it in a responsive table with sorting functionality.",
  "Implement a simple machine learning model using Python to classify text sentiment (positive/negative/neutral).",
  "Design a database schema for an e-commerce platform including users, products, orders, and relationships.",
  "Write a comprehensive guide on implementing clean code principles in JavaScript with practical examples.",
  "Create a CSS animation that smoothly transitions between different states with proper browser compatibility.",
  "Explain the differences between SQL and NoSQL databases and when to use each approach.",
  "Write a function that efficiently finds the longest common subsequence between two strings."
];

interface StreamingResult {
  model: string;
  content: string;
  reasoningContent?: string;
  isComplete: boolean;
  error?: string;
  responseTime?: number;
  tokens?: number;
  reasoningTokens?: number;
}

export function SpeedTestInterface() {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [streamingResults, setStreamingResults] = useState<StreamingResult[]>([]);
  const [popularModels, setPopularModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SpeedTestComparison | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [, setApiKeyStatus] = useState(false);

  useEffect(() => {
    // Set random prompt on load
    const randomPrompt = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(randomPrompt);

    // Check API key status
    const checkApiKeyStatus = async () => {
      try {
        const response = await apiService.getApiKeyStatus();
        if (response.success && response.data) {
          const data = response.data as ApiKeyStatusResponse;
          setApiKeyStatus(data.hasApiKey);
          setShowApiKeyInput(!data.hasApiKey);
        } else {
          setShowApiKeyInput(true);
        }
      } catch (error) {
        console.error('Error checking API key status:', error);
        setShowApiKeyInput(true);
      }
    };

    checkApiKeyStatus();
  }, []);

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

  useEffect(() => {
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
    
    // Initialize streaming results
    const initialResults: StreamingResult[] = selectedModels.map(model => ({
      model,
      content: '',
      isComplete: false
    }));
    setStreamingResults(initialResults);
    
    try {
      const response = await apiService.runSpeedTest({
        prompt: prompt.trim(),
        models: selectedModels
      });
      
      if (response.success && response.data) {
        setResults(response.data);
        // Update streaming results with final data
        const finalResults = response.data.results.map(result => ({
          model: result.model,
          content: result.response?.choices?.[0]?.message?.content || 'No response generated',
          isComplete: true,
          error: result.error || undefined,
          responseTime: result.responseTime,
          tokens: result.response?.usage?.total_tokens
        }));
        setStreamingResults(finalResults);
      } else {
        console.error('Speed test failed:', response.error);
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
    <div className="h-full flex flex-col">

      {/* API Key Setup - Centered */}
      {showApiKeyInput && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Connect API Key</CardTitle>
              <CardDescription className="text-sm">
                Enter your OpenRouter API key to start benchmarking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button 
                onClick={handleSaveApiKey} 
                disabled={!apiKey.trim()}
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Interface - Split Layout */}
      {!showApiKeyInput && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Configuration Panel */}
          <div className="flex-shrink-0 border-b bg-muted/30">
            <div className="p-4 space-y-4">
              {/* Prompt Input */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Textarea
                    placeholder="Enter your test prompt..."
                    value={prompt}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                    maxLength={2000}
                  />
                </div>
                <div className="flex-shrink-0 space-y-2">
                  <Button
                    onClick={handleRunTest}
                    disabled={!prompt.trim() || selectedModels.length === 0 || isRunning}
                    size="lg"
                    className="w-32"
                  >
                    {isRunning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Test
                      </>
                    )}
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    {selectedModels.length}/3 models
                  </div>
                </div>
              </div>
              
              {/* Model Selection - Horizontal */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {popularModels.slice(0, 8).map((model) => {
                  const isSelected = selectedModels.includes(model);
                  const [provider, modelName] = model.split('/');
                  const isDisabled = selectedModels.length >= 3 && !isSelected;
                  
                  return (
                    <button
                      key={model}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg border text-sm transition-all ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : isDisabled
                          ? 'opacity-50 cursor-not-allowed border-muted'
                          : 'hover:bg-muted border-muted'
                      }`}
                      onClick={() => !isDisabled && toggleModelSelection(model)}
                    >
                      <div className="text-center">
                        <div className="font-medium">{modelName}</div>
                        <div className="text-xs opacity-70">{provider}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Area - Full Height */}
          <div className="flex-1 overflow-hidden">
            {(isRunning || streamingResults.length > 0) ? (
              <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-1">
                {selectedModels.slice(0, 3).map((model, index) => {
                  const streamResult = streamingResults.find(r => r.model === model);
                  const [provider, modelName] = model.split('/');
                  const isComplete = streamResult?.isComplete || false;
                  const hasError = streamResult?.error;
                  
                  return (
                    <div 
                      key={model}
                      className={`flex flex-col border-r last:border-r-0 transition-all ${
                        isComplete && !hasError
                          ? 'bg-green-50/50 dark:bg-green-950/10'
                          : hasError
                          ? 'bg-red-50/50 dark:bg-red-950/10'
                          : 'bg-background'
                      }`}
                    >
                      {/* Model Header */}
                      <div className="flex-shrink-0 p-3 border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{modelName}</span>
                            {isRunning && !isComplete && (
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            )}
                            {isComplete && !hasError && (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            )}
                            {hasError && (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs px-1">
                              {provider}
                            </Badge>
                            {streamResult?.responseTime && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-2.5 w-2.5" />
                                <span className="font-mono">
                                  {formatResponseTime(streamResult.responseTime)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 overflow-hidden">
                        {hasError ? (
                          <div className="p-4 h-full flex items-center justify-center">
                            <Alert variant="destructive" className="w-full">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">{streamResult?.error}</AlertDescription>
                            </Alert>
                          </div>
                        ) : (
                          <ScrollArea className="h-full">
                            <div className="p-4 text-sm leading-relaxed space-y-3">
                              {streamResult?.reasoningContent && (
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-md border-l-2 border-blue-400">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">REASONING</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                                    {streamResult.reasoningContent}
                                    {isRunning && !isComplete && (
                                      <span className="inline-block w-0.5 h-3 bg-blue-500 animate-pulse ml-1" />
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {streamResult?.content ? (
                                <div>
                                  {streamResult.reasoningContent && (
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                      <span className="text-xs font-medium text-green-700 dark:text-green-300">ANSWER</span>
                                    </div>
                                  )}
                                  <div className="whitespace-pre-wrap">
                                    {streamResult.content}
                                    {isRunning && !isComplete && (
                                      <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-1" />
                                    )}
                                  </div>
                                </div>
                              ) : isRunning ? (
                                <div className="flex items-center justify-center h-32 text-muted-foreground">
                                  <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Generating...</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-32 text-muted-foreground">
                                  <div className="text-center">
                                    <Cpu className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Ready</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                      
                      {/* Footer Stats */}
                      {isComplete && streamResult?.tokens && (
                        <div className="flex-shrink-0 border-t p-2 bg-muted/20">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div>
                              <div>Total: {streamResult.tokens}</div>
                              {streamResult.reasoningTokens && (
                                <div className="text-blue-600 dark:text-blue-400">
                                  Reasoning: {streamResult.reasoningTokens}
                                </div>
                              )}
                            </div>
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Ready to Benchmark</p>
                  <p className="text-sm">Select models and run a test to see live results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}