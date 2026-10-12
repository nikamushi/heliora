"use client";

import React from "react";

export default function RiskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {children}
    </div>
  );
}
