import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SpeedTestInterface } from '@/components/SpeedTestInterface'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap } from 'lucide-react'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="llm-speed-test-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
              <div className="mr-6 flex items-center space-x-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight">LLM Arena</span>
                  <span className="text-xs text-muted-foreground">Speed Benchmarking</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                <div className="hidden md:flex items-center space-x-4">
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="mr-1 h-3 w-3" />
                    Real-time
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Enterprise Ready
                  </Badge>
                </div>
              </div>
              <nav className="flex items-center space-x-1">
                <ThemeToggle />
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container max-w-screen-2xl py-6">
            <SpeedTestInterface />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 md:py-0">
          <div className="container flex max-w-screen-2xl flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built with{" "}
                <span className="font-medium underline underline-offset-4">
                  shadcn/ui
                </span>
                {" "}and{" "}
                <span className="font-medium underline underline-offset-4">
                  OpenRouter API
                </span>
                .
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App