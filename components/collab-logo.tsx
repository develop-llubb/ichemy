import Image from "next/image";

export function CollabLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/befe-logo.png"
        alt="BeFe"
        width={56}
        height={24}
        priority
        className="mb-1 h-7 w-auto"
      />
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 4L12 12M12 4L4 12"
          stroke="#B8A898"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="mt-0.5 font-[family-name:var(--font-mogra)] text-[18px] text-accent">
        Chemistry
      </span>
    </div>
  );
}
