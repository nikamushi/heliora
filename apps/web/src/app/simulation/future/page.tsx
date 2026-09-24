import { redirect } from "next/navigation";

interface FutureSimulationAliasProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Top-level route alias for Future Simulation Page.
 *
 * Implements PRD sitemap and Design.md §3 specification for `/simulation/future`,
 * redirecting to `/dashboard/simulation/future` while preserving deep-linking query parameters (e.g., `?horizon=...`).
 */
export default async function FutureSimulationAliasPage({
  searchParams,
}: FutureSimulationAliasProps) {
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
    ? `/dashboard/simulation/future?${query}`
    : "/dashboard/simulation/future";
  redirect(targetUrl);
}
