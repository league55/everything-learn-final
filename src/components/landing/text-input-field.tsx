import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)
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

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div 
        className="relative group cursor-text"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Gradient background with enhanced hover effects */}
        <div 
          className={`
            absolute -inset-1 rounded-lg blur transition-all duration-300 ease-out
            ${isHovered || isFocused 
              ? 'bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#3b82f6] opacity-60' 
              : 'bg-gradient-to-r from-[#323e65] via-[#a7bfd9] to-[#609ae1] opacity-30'
            }
            ${isHovered ? 'animate-pulse' : 'animate-gradient-shift'}
          `}
        />
        
        {/* Container with scale and border effects */}
        <div 
          className={`
            relative bg-background rounded-lg border-2 transition-all duration-300 ease-out
            ${isFocused 
              ? 'border-[#6366f1] shadow-lg shadow-[#6366f1]/25' 
              : isHovered 
                ? 'border-[#8b5cf6]/60' 
                : 'border-border'
            }
            ${isHovered ? 'scale-[1.02] shadow-2xl' : 'scale-100'}
          `}
        >
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Search 
              className={`
                h-5 w-5 text-muted-foreground transition-all duration-500 ease-in-out
                ${isFocused 
                  ? 'rotate-[360deg] text-[#6366f1] scale-110' 
                  : 'rotate-0 scale-100'
                }
              `}
            />
          </div>

          <Input
            ref={inputRef}
            type="text"
            placeholder=""
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              w-full h-16 pl-12 pr-6 text-lg bg-transparent border-0 
              focus:ring-0 focus:outline-none transition-all duration-300
              ${isFocused ? 'text-foreground' : 'text-foreground'}
            `}
            onKeyPress={onKeyPress}
            disabled={disabled}
          />
          
          {/* Typewriter overlay */}
          {showTypewriter && !value && !isFocused && (
            <div 
              ref={typewriterRef}
              className="absolute inset-0 flex items-center pl-12 pr-6 pointer-events-none"
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
            <div className="absolute inset-0 flex items-center pl-12 pr-6 pointer-events-none">
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