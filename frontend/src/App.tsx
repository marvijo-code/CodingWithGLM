import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SpeedTestInterface } from '@/components/SpeedTestInterface'
import { Dashboard } from '@/components/Dashboard'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/toaster'
import { Activity, Zap } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState<'arena' | 'dashboard'>('arena');

  return (
    <ThemeProvider defaultTheme="system" storageKey="llm-speed-test-theme">
      <div className="h-screen flex flex-col bg-background">
        {/* Compact Header */}
        <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur">
          <div className="flex h-12 items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">Ultimate LLM Arena</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  <Zap className="mr-1 h-2.5 w-2.5" />
                  Live
                </Badge>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content - Full Height */}
        <main className="flex-1 overflow-hidden">
          {currentView === 'arena' ? (
            <SpeedTestInterface onShowDashboard={() => setCurrentView('dashboard')} />
          ) : (
            <Dashboard onBack={() => setCurrentView('arena')} />
          )}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App