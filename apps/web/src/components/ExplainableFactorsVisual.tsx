import React from "react";
import {
  Percent,
  Gauge,
  Target,
  CircleDashed,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart,
  LineChart,
  Compass,
  PieChart,
  Waves,
  Network,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const analyticsIcons = [
  { id: "percentage", icon: Percent },
  { id: "gauge", icon: Gauge },
  { id: "target", icon: Target },
  { id: "circular-progress", icon: CircleDashed },
  { id: "trend-up", icon: TrendingUp },
  { id: "trend-down", icon: TrendingDown },
  { id: "heartbeat", icon: Activity },
  { id: "bar-chart", icon: BarChart },
  { id: "line-chart", icon: LineChart },
  { id: "radar-chart", icon: Compass },
  { id: "donut-chart", icon: PieChart },
  { id: "waveform", icon: Waves },
  { id: "analytics-nodes", icon: Network },
  { id: "spark-insight", icon: Sparkles },
  { id: "check-circle", icon: CheckCircle2 },
  { id: "alert-circle", icon: AlertCircle },
];

export function ExplainableFactorsVisual() {
  return (
    <div className="w-full flex items-center justify-center select-none py-4">
      {/* Static 4x4 Analytics / Metric Icons Grid (Centered) */}
      <div className="grid grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-11 w-full max-w-md mx-auto items-center justify-items-center text-brand-900/70">
        {analyticsIcons.map((item) => {
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
