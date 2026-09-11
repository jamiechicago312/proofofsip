import type { Metadata } from "next";

// `/dev/*` is a component-preview area for reviewing UI in isolation (see
// the individual pages' own doc comments) — not part of the public site,
// so it's kept out of search results. A layout (server component) is used
// rather than a `metadata` export on the pages themselves, since some of
// them are client components and can't export `metadata` directly.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DevLayout({ children }: LayoutProps<"/dev">) {
  return children;
}
