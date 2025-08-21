import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SpeedTestInterface } from '@/components/SpeedTestInterface'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="container mx-auto flex h-14 items-center px-4">
            <div className="mr-4 flex">
              <h1 className="text-lg font-semibold">LLM Speed Test</h1>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                {/* Search or other controls can go here */}
              </div>
              <nav className="flex items-center">
                <ThemeToggle />
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-6 px-4">
          <SpeedTestInterface />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App