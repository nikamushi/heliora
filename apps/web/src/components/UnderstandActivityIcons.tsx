import React from "react";
import {
  Moon,
  Activity,
  Heart,
  Droplets,
  Apple,
  Footprints,
  Flame,
  Brain,
  Sun,
  Dumbbell,
  BatteryCharging,
  Coffee,
  Bike,
  Scale,
  Wind,
} from "lucide-react";

const activityIcons = [
  { id: "sleep", icon: Moon },
  { id: "run", icon: Activity },
  { id: "heart", icon: Heart },
  { id: "hydration", icon: Droplets },
  { id: "nutrition", icon: Apple },
  { id: "steps", icon: Footprints },
  { id: "energy", icon: Flame },
  { id: "mind", icon: Brain },
  { id: "sun", icon: Sun },
  { id: "workout", icon: Dumbbell },
  { id: "recovery", icon: BatteryCharging },
  { id: "caffeine", icon: Coffee },
  { id: "bike", icon: Bike },
  { id: "vitals", icon: Activity },
  { id: "scale", icon: Scale },
  { id: "breath", icon: Wind },
];

export function UnderstandActivityIcons() {
  return (
    <div className="w-full flex items-center justify-center lg:justify-end select-none py-4">
      {/* Static Icons Grid (Aligned precisely within right 7-column space) */}
      <div className="grid grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-11 w-full max-w-md mx-auto lg:mx-0 items-center justify-items-center text-brand-900/70">
        {activityIcons.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-center"
            >
              <IconComp 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11" 
                strokeWidth={1.5} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
