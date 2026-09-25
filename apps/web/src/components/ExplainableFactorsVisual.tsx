import React from "react";
import {
  IconPercentage,
  IconGauge,
  IconTarget,
  IconProgress,
  IconTrendingUp,
  IconTrendingDown,
  IconHeartbeat,
  IconChartBar,
  IconChartLine,
  IconChartRadar,
  IconChartDonut,
  IconWaveSine,
  IconChartDots,
  IconSparkles,
  IconCircleCheck,
  IconAlertCircle,
} from "@tabler/icons-react";

const analyticsIcons = [
  { id: "percentage", icon: IconPercentage },
  { id: "gauge", icon: IconGauge },
  { id: "target", icon: IconTarget },
  { id: "circular-progress", icon: IconProgress },
  { id: "trend-up", icon: IconTrendingUp },
  { id: "trend-down", icon: IconTrendingDown },
  { id: "heartbeat", icon: IconHeartbeat },
  { id: "bar-chart", icon: IconChartBar },
  { id: "line-chart", icon: IconChartLine },
  { id: "radar-chart", icon: IconChartRadar },
  { id: "donut-chart", icon: IconChartDonut },
  { id: "waveform", icon: IconWaveSine },
  { id: "analytics-nodes", icon: IconChartDots },
  { id: "spark-insight", icon: IconSparkles },
  { id: "check-circle", icon: IconCircleCheck },
  { id: "alert-circle", icon: IconAlertCircle },
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
                stroke={1.5} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
