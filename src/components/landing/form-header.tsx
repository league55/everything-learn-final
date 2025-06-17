interface FormHeaderProps {
  header: string
  subheader?: string | null
  isTransitioning: boolean
  slideDirection: 'left' | 'right'
}

export function FormHeader({ header, subheader, isTransitioning, slideDirection }: FormHeaderProps) {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isTransitioning 
          ? slideDirection === 'right' 
            ? "-translate-x-full opacity-0" 
            : "translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      }`}
    >
      {/* Header */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
        <span className="block bg-gradient-to-r from-[#323e65] to-[#a7bfd9] bg-clip-text text-transparent">
          {header}
        </span>
      </h1>

      {/* Subheader */}
      {subheader && (
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {subheader}
        </p>
      )}
    </div>
  )
}