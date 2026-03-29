"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("course-content");
    if (!el) return;
    const onScroll = () => setVisible(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <Button
      size="icon"
      variant="secondary"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg size-10 transition-all hover:scale-110"
      onClick={() =>
        document
          .getElementById("course-content")
          ?.scrollTo({ top: 0, behavior: "smooth" })
      }
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-4" />
    </Button>
  );
}
