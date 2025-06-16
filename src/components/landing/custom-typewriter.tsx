import { useState, useEffect, useRef } from 'react'

interface CustomTypewriterProps {
  strings: string[]
  onStringChange?: (index: number) => void
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
}

const colors = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEEAD', // Cream Yellow
  '#D4A5A5', // Dusty Rose
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#2ECC71'  // Emerald Green
]

export function CustomTypewriter({ 
  strings, 
  onStringChange,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000
}: CustomTypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentStringIndex, setCurrentStringIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const currentColor = colors[currentStringIndex % colors.length]

  useEffect(() => {
    // Cursor blinking animation
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 700) // 0.7s blink animation

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    const currentString = strings[currentStringIndex]

    const typeCharacter = () => {
      if (!isDeleting) {
        // Typing forward
        if (currentCharIndex < currentString.length) {
          setDisplayText(currentString.slice(0, currentCharIndex + 1))
          setCurrentCharIndex(prev => prev + 1)
          timeoutRef.current = setTimeout(typeCharacter, typingSpeed)
        } else {
          // Finished typing, pause then start deleting
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true)
            typeCharacter()
          }, pauseDuration)
        }
      } else {
        // Deleting backward
        if (currentCharIndex > 0) {
          setDisplayText(currentString.slice(0, currentCharIndex - 1))
          setCurrentCharIndex(prev => prev - 1)
          timeoutRef.current = setTimeout(typeCharacter, deletingSpeed)
        } else {
          // Finished deleting, move to next string
          setIsDeleting(false)
          const nextIndex = (currentStringIndex + 1) % strings.length
          setCurrentStringIndex(nextIndex)
          onStringChange?.(nextIndex)
          timeoutRef.current = setTimeout(typeCharacter, typingSpeed)
        }
      }
    }

    timeoutRef.current = setTimeout(typeCharacter, typingSpeed)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentStringIndex, currentCharIndex, isDeleting, strings, typingSpeed, deletingSpeed, pauseDuration, onStringChange])

  return (
    <div className="inline-flex items-center">
      <span 
        className="typewriter-text"
        style={{ 
          color: currentColor,
          fontFamily: '"Akaya Telivigala", cursive',
          fontSize: '1.2rem',
          lineHeight: '1.4'
        }}
      >
        {displayText}
      </span>
      <span 
        className="typewriter-cursor"
        style={{ 
          color: '#000000',
          fontFamily: '"Akaya Telivigala", cursive',
          fontSize: '1.2rem',
          marginLeft: '2px',
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 0.1s ease-in-out'
        }}
      >
        |
      </span>
    </div>
  )
}