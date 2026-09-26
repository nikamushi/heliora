"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

function Tooltip({ children, ...props }: TooltipPrimitive.Root.Props) {
  return (
    <TooltipPrimitive.Root {...props}>
      {children}
    </TooltipPrimitive.Root>
  );
}

interface TooltipTriggerProps extends TooltipPrimitive.Trigger.Props {
  asChild?: boolean;
}

function TooltipTrigger({ asChild, children, ...props }: TooltipTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return (
      <TooltipPrimitive.Trigger
        data-slot="tooltip-trigger"
        render={children}
        delay={150}
        closeDelay={100}
        {...props}
      />
    );
  }
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      delay={150}
      closeDelay={100}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

interface TooltipContentProps extends TooltipPrimitive.Popup.Props {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

function TooltipContent({
  className,
  side = "top",
  align = "center",
  sideOffset = 6,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner side={side} align={align} sideOffset={sideOffset}>
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 max-w-xs rounded-xl border border-brand-900/10 bg-white/95 px-3 py-2 text-xs font-medium text-brand-900 shadow-lg backdrop-blur-md transition-opacity duration-150",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
