import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Users, 
  PartyPopper, 
  Sparkles, 
  Compass, 
  Target, 
  Rocket, 
  Building, 
  BookOpen, 
  TrendingUp,
  Coffee,
  Home,
  Globe,
  Lightbulb,
  Award,
  Clock,
  Star,
  Zap
} from 'lucide-react'

// Import required Swiper styles
import 'swiper/css'

interface ContextCarouselProps {
  onContextSelect: (context: string) => void
  isActive: boolean
}

const contexts = [
  { text: "For fun and personal enjoyment", icon: Heart },
  { text: "To apply at work and advance my career", icon: Briefcase },
  { text: "Doing research for my PhD thesis", icon: GraduationCap },
  { text: "To show off in front of friends", icon: Users },
  { text: "To shine at a party with interesting facts", icon: PartyPopper },
  { text: "Just want to learn something new", icon: Sparkles },
  { text: "Just exploring and being curious", icon: Compass },
  { text: "To achieve a specific goal I have", icon: Target },
  { text: "To launch my own startup project", icon: Rocket },
  { text: "For my university coursework", icon: Building },
  { text: "To become a better version of myself", icon: BookOpen },
  { text: "To stay competitive in my field", icon: TrendingUp },
  { text: "For casual weekend learning", icon: Coffee },
  { text: "To teach my kids at home", icon: Home },
  { text: "To prepare for traveling abroad", icon: Globe },
  { text: "Because I had a brilliant idea", icon: Lightbulb },
  { text: "To earn a certification or credential", icon: Award },
  { text: "To make good use of my free time", icon: Clock },
  { text: "To pursue my passion project", icon: Star },
  { text: "To quickly solve a current problem", icon: Zap }
]

// Split contexts into two rows
const contextsRow1 = contexts.slice(0, Math.ceil(contexts.length / 2))
const contextsRow2 = contexts.slice(Math.ceil(contexts.length / 2))

export function ContextCarousel({ onContextSelect, isActive }: ContextCarouselProps) {
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

  const handleContextClick = (context: string) => {
    if (isActive) {
      onContextSelect(context)
    }
  }

  const ContextButton = ({ context, icon: Icon }: { context: string; icon: any }) => (
    <button
      onClick={() => handleContextClick(context)}
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
          {context}
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
          {[...contextsRow1, ...contextsRow1, ...contextsRow1].map((context, index) => (
            <SwiperSlide key={`row1-${index}`} className="!w-auto">
              <ContextButton context={context.text} icon={context.icon} />
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
          {[...contextsRow2, ...contextsRow2, ...contextsRow2].map((context, index) => (
            <SwiperSlide key={`row2-${index}`} className="!w-auto">
              <ContextButton context={context.text} icon={context.icon} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}