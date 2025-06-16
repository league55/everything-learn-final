import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { 
  Code, 
  Brain, 
  TrendingUp, 
  FileCode, 
  Palette, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Cloud, 
  Coins, 
  Figma, 
  GitBranch, 
  Bot, 
  Gamepad2, 
  ShoppingCart,
  Database,
  Camera,
  Music,
  BookOpen,
  Calculator,
  Terminal,
  Lock,
  Layers,
  Coffee,
  Utensils,
  TreePine,
  Droplets,
  Mic,
  Scissors,
  Clock,
  Mail,
  Leaf,
  Shapes,
  Users
} from 'lucide-react'

// Import required Swiper styles
import 'swiper/css'

interface TopicCarouselProps {
  onTopicSelect: (topic: string) => void
  isActive: boolean
}

const topics = [
  // Technical - narrow scope
  { title: "React useState Hook", icon: Code },
  { title: "Python List Comprehensions", icon: FileCode },
  { title: "CSS Flexbox Layout", icon: Palette },
  { title: "Git Branching Strategies", icon: GitBranch },
  { title: "SQL JOIN Operations", icon: Database },
  { title: "JavaScript Async/Await", icon: Code },
  { title: "Docker Container Basics", icon: Cloud },
  { title: "API Rate Limiting", icon: Shield },
  { title: "Redux State Management", icon: Layers },
  { title: "TypeScript Interfaces", icon: FileCode },
  { title: "Linux Command Line", icon: Terminal },
  { title: "JWT Authentication", icon: Lock },
  
  // Non-technical - narrow scope
  { title: "French Pronunciation", icon: Mic },
  { title: "Sourdough Bread Making", icon: Utensils },
  { title: "Chess Opening Theory", icon: Brain },
  { title: "Watercolor Wet-on-Wet", icon: Droplets },
  { title: "Personal Budgeting", icon: Calculator },
  { title: "Speed Reading Techniques", icon: BookOpen },
  { title: "Wine Tasting Basics", icon: Coffee },
  { title: "Public Speaking Body Language", icon: Users },
  { title: "Meditation Breathing", icon: TreePine },
  { title: "Knitting Basic Stitches", icon: Scissors },
  { title: "Guitar Chord Progressions", icon: Music },
  { title: "Time Management Pomodoro", icon: Clock },
  { title: "Email Writing Etiquette", icon: Mail },
  { title: "Houseplant Care", icon: Leaf },
  { title: "Origami Basic Folds", icon: Shapes },
  { title: "Photography Rule of Thirds", icon: Camera }
]

// Split topics into two rows
const topicsRow1 = topics.slice(0, Math.ceil(topics.length / 2))
const topicsRow2 = topics.slice(Math.ceil(topics.length / 2))

export function TopicCarousel({ onTopicSelect, isActive }: TopicCarouselProps) {
  const swiperRow1Ref = useRef<any>(null)
  const swiperRow2Ref = useRef<any>(null)

  const handleMouseEnter = () => {
    if (swiperRow1Ref.current?.swiper) {
      swiperRow1Ref.current.swiper.autoplay.stop()
    }
    if (swiperRow2Ref.current?.swiper) {
      swiperRow2Ref.current.swiper.autoplay.stop()
    }
  }

  const handleMouseLeave = () => {
    if (swiperRow1Ref.current?.swiper) {
      swiperRow1Ref.current.swiper.autoplay.start()
    }
    if (swiperRow2Ref.current?.swiper) {
      swiperRow2Ref.current.swiper.autoplay.start()
    }
  }

  const handleTopicClick = (topic: string) => {
    if (isActive) {
      onTopicSelect(topic)
    }
  }

  const TopicButton = ({ topic, icon: Icon }: { topic: string; icon: any }) => (
    <button
      onClick={() => handleTopicClick(topic)}
      className={`
        group relative px-6 py-3 rounded-full border border-border/30 bg-card/50 backdrop-blur-sm
        hover:border-[#6366f1]/60 hover:bg-card/80 hover:scale-105 hover:-translate-y-0.5
        active:scale-95 transition-all duration-300 ease-out
        ${isActive ? 'cursor-pointer' : 'cursor-default opacity-60'}
      `}
      disabled={!isActive}
    >
      <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all duration-300" />
        <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          {topic}
        </span>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </button>
  )

  return (
    <div 
      className="w-full py-8 space-y-4 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Row 1 - Right to Left */}
      <div className="w-full">
        <Swiper
          ref={swiperRow1Ref}
          modules={[Autoplay]}
          slidesPerView="auto"
          spaceBetween={16}
          loop={true}
          autoplay={{
            delay: 0,
            duration: 2000,
            reverseDirection: false,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          speed={2000}
          className="!overflow-visible"
          freeMode={true}
          allowTouchMove={false}
        >
          {[...topicsRow1, ...topicsRow1, ...topicsRow1].map((topic, index) => (
            <SwiperSlide key={`row1-${index}`} className="!w-auto">
              <TopicButton topic={topic.title} icon={topic.icon} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Row 2 - Left to Right */}
      <div className="w-full">
        <Swiper
          ref={swiperRow2Ref}
          modules={[Autoplay]}
          slidesPerView="auto"
          spaceBetween={16}
          loop={true}
          autoplay={{
            delay: 0,
            duration: 2000,
            reverseDirection: true,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          speed={2000}
          className="!overflow-visible"
          freeMode={true}
          allowTouchMove={false}
        >
          {[...topicsRow2, ...topicsRow2, ...topicsRow2].map((topic, index) => (
            <SwiperSlide key={`row2-${index}`} className="!w-auto">
              <TopicButton topic={topic.title} icon={topic.icon} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}