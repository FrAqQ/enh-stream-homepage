
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  indicatorColor?: string;
  showTooltip?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, indicatorColor, showTooltip = false, ...props }, ref) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  
  // Handle mouse move to show tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !showTooltip) return;
    
    const track = trackRef.current;
    const trackRect = track.getBoundingClientRect();
    const percent = Math.min(1, Math.max(0, (e.clientX - trackRect.left) / trackRect.width));
    
    const min = props.min || 0;
    const max = props.max || 100;
    const value = Math.round(min + percent * (max - min));
    
    setHoveredValue(value);
  };
  
  const handleMouseLeave = () => {
    setHoveredValue(null);
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track 
        ref={trackRef}
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <SliderPrimitive.Range className={cn("absolute h-full bg-primary", indicatorColor)} />
      </SliderPrimitive.Track>
      
      {props.value && Array.isArray(props.value) && props.value.map((value, i) => (
        <SliderPrimitive.Thumb 
          key={i} 
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
      
      {hoveredValue !== null && showTooltip && (
        <div 
          className="absolute -top-8 px-2 py-1 bg-primary text-primary-foreground text-xs rounded shadow-md pointer-events-none"
          style={{
            left: `${((hoveredValue - (props.min || 0)) / ((props.max || 100) - (props.min || 0))) * 100}%`,
            transform: 'translateX(-50%)'
          }}
        >
          {hoveredValue}
        </div>
      )}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

// Add missing useState import
const { useState } = React;

export { Slider }
