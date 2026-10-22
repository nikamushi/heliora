import React from "react";
import {
  Check,
  ArrowRight,
  Footprints,
  MousePointerClick,
  Compass,
  Target,
  Flag,
  Rocket,
  CalendarCheck,
  ListChecks,
  PlusCircle,
  Route,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  CircleArrowRight,
} from "lucide-react";

const recommendationIcons = [
  { id: "checkmark", icon: Check },
  { id: "arrow-forward", icon: ArrowRight },
  { id: "footstep", icon: Footprints },
  { id: "hand-tap", icon: MousePointerClick },
  { id: "compass", icon: Compass },
  { id: "target", icon: Target },
  { id: "flag", icon: Flag },
  { id: "rocket", icon: Rocket },
  { id: "calendar-check", icon: CalendarCheck },
  { id: "checklist", icon: ListChecks },
  { id: "plus-circle", icon: PlusCircle },
  { id: "path-route", icon: Route },
  { id: "lightbulb", icon: Lightbulb },
  { id: "shield-check", icon: ShieldCheck },
  { id: "spark-check", icon: Sparkles },
  { id: "arrow-circle", icon: CircleArrowRight },
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
                strokeWidth={1.5} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
