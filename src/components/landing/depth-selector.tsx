import { Slider } from '@/components/ui/slider'

interface DepthSelectorProps {
  value: number
  onChange: (value: number) => void
  disabled: boolean
}

const depthLabels = {
  1: "Just exploring the topic",
  2: "Ready to dip my toes",
  3: "I am up for a solid studying session",
  4: "I really want to learn this!",
  5: "I am going to use this professionally"
}

export function DepthSelector({ value, onChange, disabled }: DepthSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="space-y-8">
        {/* Depth Label */}
        <div className="text-2xl font-bold text-foreground">
          {depthLabels[value as keyof typeof depthLabels]}
        </div>
        
        {/* Slider */}
        <div className="max-w-md mx-auto">
          <Slider
            value={[value]}
            onValueChange={(newValue) => onChange(newValue[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
            disabled={disabled}
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
      </div>
    </div>
  )
}