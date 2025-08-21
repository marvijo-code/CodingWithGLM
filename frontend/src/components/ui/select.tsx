import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const useSelect = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select')
  }
  return context
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value = '', onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange: onValueChange || (() => {}), open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className = '', children, ...props }, ref) => {
    const { open, setOpen } = useSelect()
    
    return (
      <button
        ref={ref}
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = useSelect()
  return <span>{value || placeholder}</span>
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

const SelectContent = ({ children, className = '' }: SelectContentProps) => {
  const { open } = useSelect()
  
  if (!open) return null
  
  return (
    <div className={`absolute top-full left-0 z-50 w-full mt-1 max-h-96 overflow-hidden rounded-md border bg-white shadow-md ${className}`}>
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const SelectItem = ({ value, children, className = '' }: SelectItemProps) => {
  const { onValueChange, setOpen } = useSelect()
  
  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
    >
      {children}
    </div>
  )
}

// Unused components for compatibility
const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const SelectLabel = ({ children }: { children: React.ReactNode }) => <div className="py-1.5 pl-2 pr-2 text-sm font-semibold">{children}</div>
const SelectSeparator = () => <div className="my-1 h-px bg-gray-200" />

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
