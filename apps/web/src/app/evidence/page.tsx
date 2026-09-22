import { redirect } from "next/navigation";

interface EvidencePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Top-level route alias for Evidence Center.
 *
 * Implements PRD sitemap and Design.md §3 specification for `/evidence`,
 * redirecting to `/dashboard/evidence` while preserving deep-linking query parameters (e.g., `?ref=...`).
 */
export default async function EvidencePage({ searchParams }: EvidencePageProps) {
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
  const targetUrl = query ? `/dashboard/evidence?${query}` : "/dashboard/evidence";
  redirect(targetUrl);
}
