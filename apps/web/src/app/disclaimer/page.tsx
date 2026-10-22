import { redirect } from "next/navigation";

/**
 * Public route alias for Medical Disclaimer.
 * Redirects to the verbatim medical disclaimer section within /terms.
 */
export default function DisclaimerPage() {
  redirect("/terms#disclaimer-medis");
}
