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
      <TooltipPrimitive.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 max-w-xs rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-100 shadow-xl backdrop-blur-md transition-opacity duration-150 animate-in fade-in-0 zoom-in-95",
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
