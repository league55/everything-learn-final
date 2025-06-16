import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { CustomTypewriter } from './custom-typewriter'

const topics = [
  {
    text: "React Development",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    text: "Web3 Security",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    text: "AI Fundamentals",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    text: "Blockchain Basics",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    text: "Machine Learning",
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    text: "Cybersecurity",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  }
]

export function TypewriterHero() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleScrollToNext = () => {
    const nextSection = document.getElementById('course-creation-section')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleStringChange = (index: number) => {
    setCurrentTopicIndex(index)
  }

  useEffect(() => {
    setImageLoaded(false)
    // Preload the image
    const img = new Image()
    img.onload = () => setImageLoaded(true)
    img.src = topics[currentTopicIndex].image
  }, [currentTopicIndex])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center w-full">
          {/* Left Side - Text Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Today I want to learn
              </h1>
              
              <div className="text-4xl lg:text-6xl font-bold min-h-[1.5em] flex items-center">
                <CustomTypewriter
                  strings={topics.map(topic => topic.text)}
                  onStringChange={handleStringChange}
                  typingSpeed={100}
                  deletingSpeed={50}
                  pauseDuration={2000}
                />
              </div>
            </div>

            <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl leading-relaxed">
              Embark on an extraordinary learning journey through our curated courses and roadmaps. 
              Master new skills in a cosmic environment designed for exploration and growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button 
                size="lg"
                onClick={handleScrollToNext}
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Start Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                asChild
                className="px-8 py-4 text-lg font-semibold border-2 border-blue-400/30 text-blue-400 hover:bg-blue-400/10 rounded-full backdrop-blur-sm transition-all duration-300"
              >
                <a href="/courses">Browse Courses</a>
              </Button>
            </div>
          </div>

          {/* Right Side - Dynamic Image */}
          <div className="lg:col-span-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
              
              <img
                src={topics[currentTopicIndex].image}
                alt={topics[currentTopicIndex].text}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Loading overlay */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
              )}

              {/* Image border glow effect */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg -z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
          <div className="w-1 h-3 bg-white/60 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  )
}