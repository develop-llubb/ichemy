import Image from "next/image";

interface CouponTicketProps {
  title: string;
  description: string;
  stubText?: string;
  stubEmoji?: string;
}

export function CouponTicket({
  title,
  description,
  stubText = "FREE",
  stubEmoji = "🎟️",
}: CouponTicketProps) {
  return (
    <div className="relative w-full">
      <div className="absolute top-1/2 -left-3 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />
      <div className="absolute top-1/2 -right-3 z-10 h-6 w-6 -translate-y-1/2 rounded-full bg-background" />

      <div
        className="flex overflow-hidden rounded-[18px]"
        style={{ boxShadow: "0 4px 20px rgba(212,115,92,0.12)" }}
      >
        {/* Left section — main info */}
        <div
          className="flex flex-1 flex-col justify-center p-6 text-white items-start"
          style={{
            background: "linear-gradient(160deg, #D4735C, #C0614A)",
          }}
        >
          <div className="flex items-center gap-2">
            {/* <div className="inline-block rounded-md bg-white px-2 py-1"> */}
            <Image
              src="/befe-logo.png"
              alt="BeFe"
              width={40}
              height={18}
              className="h-6 w-auto"
            />
            {/* </div> */}
          </div>
          <div className="mt-2 text-[15px] font-extrabold leading-snug">
            {title}
          </div>
          <div className="mt-1 text-[11px] leading-[1.5] opacity-85 text-left">
            {description}
          </div>
        </div>

        {/* Dashed perforation line */}
        <div className="relative w-0">
          <div className="absolute inset-y-3 left-0 w-0 border-l-2 border-dashed border-white/30" />
        </div>

        {/* Right section — ticket stub */}
        <div
          className="flex w-[100px] shrink-0 flex-col items-center justify-center text-white"
          style={{
            background: "linear-gradient(160deg, #C0614A, #B05540)",
          }}
        >
          <span className="text-3xl">{stubEmoji}</span>
          <span className="mt-1 text-[10px] font-bold tracking-wider opacity-90">
            {stubText}
          </span>
        </div>
      </div>
    </div>
  );
}
