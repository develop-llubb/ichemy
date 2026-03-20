"use client";

import { useState } from "react";
import { updateThirdPartyAgreed } from "./action";

export function ThirdPartyToggle({ initialAgreed }: { initialAgreed: boolean }) {
  const [agreed, setAgreed] = useState(initialAgreed);

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#ECE8E3] bg-white px-4 py-3">
      <span className="text-[13px] font-medium text-foreground">
        제3자 정보 제공 동의
      </span>
      <label className="cursor-pointer">
        <div
          className="relative h-6 w-11 rounded-full transition-colors"
          style={{ background: agreed ? "#D4735C" : "#D4CFC8" }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={async (e) => {
              const value = e.target.checked;
              setAgreed(value);
              await updateThirdPartyAgreed(value);
            }}
            className="sr-only"
          />
          <div
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: agreed ? "translateX(22px)" : "translateX(2px)" }}
          />
        </div>
      </label>
    </div>
  );
}
