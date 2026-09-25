import React from "react";
import {
  IconRun,
  IconWalk,
  IconMoon,
  IconDroplet,
  IconFlame,
  IconHeart,
  IconActivity,
  IconBrain,
  IconBike,
  IconBarbell,
  IconSun,
  IconApple,
  IconCoffee,
  IconBatteryCharging,
  IconWind,
  IconScale,
} from "@tabler/icons-react";

const activityIcons = [
  { id: "sleep", icon: IconMoon },
  { id: "run", icon: IconRun },
  { id: "heart", icon: IconHeart },
  { id: "hydration", icon: IconDroplet },
  { id: "nutrition", icon: IconApple },
  { id: "steps", icon: IconWalk },
  { id: "energy", icon: IconFlame },
  { id: "mind", icon: IconBrain },
  { id: "sun", icon: IconSun },
  { id: "workout", icon: IconBarbell },
  { id: "recovery", icon: IconBatteryCharging },
  { id: "caffeine", icon: IconCoffee },
  { id: "bike", icon: IconBike },
  { id: "vitals", icon: IconActivity },
  { id: "scale", icon: IconScale },
  { id: "breath", icon: IconWind },
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
                stroke={1.5} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
