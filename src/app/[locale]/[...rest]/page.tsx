import { notFound } from "next/navigation";

// Catch-all route — any path under /[locale]/ that doesn't match a real
// segment lands here and is forwarded to the locale-aware not-found.tsx.
// Without this, Next.js falls through to its built-in unstyled 404 page
// because next-intl's static prerender doesn't auto-route unmatched paths.
export default function CatchAllNotFound() {
  notFound();
}
