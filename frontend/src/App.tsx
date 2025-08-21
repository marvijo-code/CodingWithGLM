import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { SpeedTestInterface } from '@/components/SpeedTestInterface'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0d0d0d] transition-colors">
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-white dark:bg-[#171717] border-gray-200 dark:border-gray-800 px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                LLM Speed Test
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <SpeedTestInterface />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App