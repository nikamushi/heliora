import React from "react";
import {
  GitFork,
  Route,
  Split,
  Milestone,
  Clock,
  Calendar,
  Sunset,
  Shuffle,
  SlidersHorizontal,
  ToggleRight,
  Play,
  RefreshCw,
  ArrowLeftRight,
  Spline,
  Minus,
  ArrowRight,
} from "lucide-react";

const simulationIcons = [
  { id: "branch-fork", icon: GitFork },
  { id: "path-route", icon: Route },
  { id: "arrow-split", icon: Split },
  { id: "timeline", icon: Milestone },
  { id: "clock-future", icon: Clock },
  { id: "calendar", icon: Calendar },
  { id: "future-horizon", icon: Sunset },
  { id: "shuffle", icon: Shuffle },
  { id: "sliders", icon: SlidersHorizontal },
  { id: "toggle", icon: ToggleRight },
  { id: "play", icon: Play },
  { id: "refresh-cycle", icon: RefreshCw },
  { id: "two-paths", icon: ArrowLeftRight },
  { id: "trajectory-curve", icon: Spline },
  { id: "projection-dotted", icon: Minus },
  { id: "arrow-forward", icon: ArrowRight },
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
                strokeWidth={1.5} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
