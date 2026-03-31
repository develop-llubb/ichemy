"use client";

import { useEffect } from "react";

export function DarkBody() {
  useEffect(() => {
    document.body.classList.add("dark");
    return () => {
      document.body.classList.remove("dark");
    };
  }, []);

  return null;
}
