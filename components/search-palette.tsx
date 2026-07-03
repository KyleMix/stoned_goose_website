"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

// Lightweight shell that owns the keyboard shortcut and lazy-loads the
// real palette (cmdk + Radix Dialog + Pagefind) on first open. Keeps the
// search machinery out of the shared First Load JS on every page. The nav
// search button opens this by synthesizing a Cmd+K keydown on window.
const SearchPaletteDialog = dynamic(
  () =>
    import("@/components/search-palette-dialog").then(
      (mod) => mod.SearchPaletteDialog,
    ),
  { ssr: false },
);

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !isEditableTarget(e.target);
      if (isCmdK || isSlash) {
        e.preventDefault();
        setLoaded(true);
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    track("Search Open");
  }, [open]);

  if (!loaded) return null;

  return <SearchPaletteDialog open={open} onOpenChange={setOpen} />;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable
  );
}
