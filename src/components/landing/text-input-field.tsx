import { Input } from '@/components/ui/input'

interface TextInputFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  onKeyPress: (e: React.KeyboardEvent) => void
  disabled: boolean
}

export function TextInputField({ value, onChange, placeholder, onKeyPress, disabled }: TextInputFieldProps) {
  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#323e65] via-[#a7bfd9] to-[#609ae1] rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity animate-gradient-shift" />
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-16 px-6 text-lg bg-background border-2 border-border rounded-lg focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/60"
            onKeyPress={onKeyPress}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}