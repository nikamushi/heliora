import React from "react";
import {
  IconCheck,
  IconArrowRight,
  IconShoe,
  IconHandClick,
  IconCompass,
  IconTarget,
  IconFlag,
  IconRocket,
  IconCalendarCheck,
  IconChecklist,
  IconCirclePlus,
  IconRoute,
  IconBulb,
  IconShieldCheck,
  IconSparkles,
  IconCircleArrowRight,
} from "@tabler/icons-react";

const recommendationIcons = [
  { id: "checkmark", icon: IconCheck },
  { id: "arrow-forward", icon: IconArrowRight },
  { id: "footstep", icon: IconShoe },
  { id: "hand-tap", icon: IconHandClick },
  { id: "compass", icon: IconCompass },
  { id: "target", icon: IconTarget },
  { id: "flag", icon: IconFlag },
  { id: "rocket", icon: IconRocket },
  { id: "calendar-check", icon: IconCalendarCheck },
  { id: "checklist", icon: IconChecklist },
  { id: "plus-circle", icon: IconCirclePlus },
  { id: "path-route", icon: IconRoute },
  { id: "lightbulb", icon: IconBulb },
  { id: "shield-check", icon: IconShieldCheck },
  { id: "spark-check", icon: IconSparkles },
  { id: "arrow-circle", icon: IconCircleArrowRight },
];

export function RecommendationsEvidenceVisual() {
  return (
    <div className="w-full flex items-center justify-center select-none py-4">
      {/* Static 4x4 Recommendation / Action / Evidence Icons Grid (Centered) */}
      <div className="grid grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-11 w-full max-w-md mx-auto items-center justify-items-center text-brand-900/70">
        {recommendationIcons.map((item) => {
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
