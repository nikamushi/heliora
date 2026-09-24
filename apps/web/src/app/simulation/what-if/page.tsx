import { redirect } from "next/navigation";

interface WhatIfSimulationAliasProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Top-level route alias for What-If Simulation Page.
 *
 * Implements PRD sitemap and Design.md §3 specification for `/simulation/what-if`,
 * redirecting to `/dashboard/simulation/what-if` while preserving query parameters.
 */
export default async function WhatIfSimulationAliasPage({
  searchParams,
}: WhatIfSimulationAliasProps) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === "string") {
        queryString.append(key, val);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          queryString.append(key, item);
        }
      }
    }
  }

  const query = queryString.toString();
  const targetUrl = query
    ? `/dashboard/simulation/what-if?${query}`
    : "/dashboard/simulation/what-if";
  redirect(targetUrl);
}
