import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SpeedTestInterface } from '@/components/SpeedTestInterface'
import { BrainCircuit } from 'lucide-react'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-full opacity-50" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  LLM Speed Arena
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  AI Model Performance Benchmarking
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
              <nav className="flex items-center space-x-1">
                <ThemeToggle />
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-8 px-4">
          <SpeedTestInterface />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App