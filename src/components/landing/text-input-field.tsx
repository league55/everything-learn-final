import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import Typewriter from 'typewriter-effect'

interface TextInputFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  onKeyPress: (e: React.KeyboardEvent) => void
  disabled: boolean
  suggestions?: string[]
}

const defaultTopicSuggestions = [
  "React Development",
  "Machine Learning",
  "Digital Marketing",
  "Python Programming",
  "Web Design",
  "Data Science",
  "Mobile App Development",
  "Cybersecurity",
  "Cloud Computing",
  "Blockchain Technology",
  "UI/UX Design",
  "DevOps",
  "Artificial Intelligence",
  "Game Development",
  "E-commerce"
]

const defaultContextSuggestions = [
  "I want to build web applications for my startup",
  "I need this for my university studies",
  "I want to change careers to tech",
  "I'm preparing for job interviews",
  "I want to freelance as a developer",
  "I need to upskill for my current job",
  "I want to start my own business",
  "I'm curious and love learning new things",
  "I want to automate repetitive tasks",
  "I need this for a personal project",
  "I want to teach others",
  "I'm looking to get promoted",
  "I want to solve real-world problems",
  "I need this for certification",
  "I want to stay updated with technology"
]

export function TextInputField({ 
  value, 
  onChange, 
  placeholder, 
  onKeyPress, 
  disabled,
  suggestions 
}: TextInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [typewriterText, setTypewriterText] = useState('')
  const [showTypewriter, setShowTypewriter] = useState(true)
  const typewriterRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine which suggestions to use based on placeholder
  const getSuggestions = () => {
    if (suggestions) return suggestions
    if (placeholder.includes('React hooks') || placeholder.includes('Machine Learning')) {
      return defaultTopicSuggestions
    }
    return defaultContextSuggestions
  }

  const currentSuggestions = getSuggestions()

  useEffect(() => {
    // Hide typewriter if user has typed something or input is focused
    if (value.length > 0 || isFocused) {
      setShowTypewriter(false)
    } else {
      setShowTypewriter(true)
    }
  }, [value, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    setShowTypewriter(false)
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Only show typewriter again if input is empty
    if (value.length === 0) {
      setShowTypewriter(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Hide typewriter immediately when user starts typing
    if (newValue.length > 0) {
      setShowTypewriter(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#323e65] via-[#a7bfd9] to-[#609ae1] rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity animate-gradient-shift" />
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder=""
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full h-16 px-6 text-lg bg-background border-2 border-border rounded-lg focus:border-primary transition-all duration-300"
            onKeyPress={onKeyPress}
            disabled={disabled}
          />
          
          {/* Typewriter overlay */}
          {showTypewriter && !value && !isFocused && (
            <div 
              ref={typewriterRef}
              className="absolute inset-0 flex items-center px-6 pointer-events-none"
            >
              <div className="text-lg text-muted-foreground/60 font-normal">
                <Typewriter
                  options={{
                    strings: currentSuggestions,
                    autoStart: true,
                    loop: true,
                    delay: 75,
                    deleteSpeed: 30,
                    pauseFor: 2500,
                    cursor: '|',
                    cursorClassName: 'text-muted-foreground/40'
                  }}
                  onInit={(typewriter) => {
                    typewriter.start()
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Static placeholder when typewriter is not showing */}
          {!showTypewriter && !value && isFocused && (
            <div className="absolute inset-0 flex items-center px-6 pointer-events-none">
              <span className="text-lg text-muted-foreground/60">
                {placeholder}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}