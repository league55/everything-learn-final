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
  Calculator
} from 'lucide-react'

// Import required Swiper styles
import 'swiper/css'

interface TopicCarouselProps {
  onTopicSelect: (topic: string) => void
  isActive: boolean
}

const topics = [
  { title: "React Development", icon: Code },
  { title: "Machine Learning", icon: Brain },
  { title: "Digital Marketing", icon: TrendingUp },
  { title: "Python Programming", icon: FileCode },
  { title: "Web Design", icon: Palette },
  { title: "Data Science", icon: BarChart3 },
  { title: "Mobile App Development", icon: Smartphone },
  { title: "Cybersecurity", icon: Shield },
  { title: "Cloud Computing", icon: Cloud },
  { title: "Blockchain Technology", icon: Coins },
  { title: "UI/UX Design", icon: Figma },
  { title: "DevOps", icon: GitBranch },
  { title: "Artificial Intelligence", icon: Bot },
  { title: "Game Development", icon: Gamepad2 },
  { title: "E-commerce", icon: ShoppingCart },
  { title: "Database Management", icon: Database },
  { title: "Photography", icon: Camera },
  { title: "Music Production", icon: Music },
  { title: "Creative Writing", icon: BookOpen },
  { title: "Financial Analysis", icon: Calculator }
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