import { cn } from "@/lib/utils";

/** Selo circular com rotação extremamente lenta (60s por volta). */
export function CircularText({
  text,
  className,
  center,
  label,
}: {
  text: string;
  className?: string;
  center?: React.ReactNode;
  label: string;
}) {
  return (
    <div role="img" aria-label={label} className={cn("relative grid place-items-center", className)}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-spin-slow" aria-hidden>
        <defs>
          <path id="mk-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.75" />
        <text fill="currentColor" fontSize="12.5" letterSpacing="3.6" className="font-sans uppercase">
          <textPath href="#mk-circle" textLength="486">
            {text}
          </textPath>
        </text>
      </svg>
      <div aria-hidden className="relative">{center}</div>
    </div>
  );
}
