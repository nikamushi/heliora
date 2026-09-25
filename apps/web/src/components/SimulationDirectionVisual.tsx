import React from "react";
import {
  IconGitFork,
  IconRoute,
  IconArrowsSplit,
  IconTimeline,
  IconClockPlay,
  IconCalendar,
  IconSunset,
  IconArrowsShuffle,
  IconAdjustmentsHorizontal,
  IconToggleRight,
  IconPlayerPlay,
  IconRefresh,
  IconArrowsDiff,
  IconVectorSpline,
  IconLineDashed,
  IconArrowRight,
} from "@tabler/icons-react";

const simulationIcons = [
  { id: "branch-fork", icon: IconGitFork },
  { id: "path-route", icon: IconRoute },
  { id: "arrow-split", icon: IconArrowsSplit },
  { id: "timeline", icon: IconTimeline },
  { id: "clock-future", icon: IconClockPlay },
  { id: "calendar", icon: IconCalendar },
  { id: "future-horizon", icon: IconSunset },
  { id: "shuffle", icon: IconArrowsShuffle },
  { id: "sliders", icon: IconAdjustmentsHorizontal },
  { id: "toggle", icon: IconToggleRight },
  { id: "play", icon: IconPlayerPlay },
  { id: "refresh-cycle", icon: IconRefresh },
  { id: "two-paths", icon: IconArrowsDiff },
  { id: "trajectory-curve", icon: IconVectorSpline },
  { id: "projection-dotted", icon: IconLineDashed },
  { id: "arrow-forward", icon: IconArrowRight },
];

export function SimulationDirectionVisual() {
  return (
    <div className="w-full flex items-center justify-center select-none py-4">
      {/* Static 4x4 Simulation / Direction Icons Grid (Centered) */}
      <div className="grid grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-11 w-full max-w-md mx-auto items-center justify-items-center text-brand-900/70">
        {simulationIcons.map((item) => {
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
