type P = React.SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.25, "aria-hidden": true } as const;

export function InstagramIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ThreadsIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M16.6 11.2c-.3-2.4-1.9-3.7-4.3-3.7-2.1 0-3.6 1.1-4 2.7" />
      <path d="M16.6 11.2c.2 1.5-.2 3.6-2.6 3.9-1.7.2-3-.7-3-2 0-1.4 1.4-2.1 3.1-2.1 2.7 0 5.6 1.2 5.6 4.2 0 3.3-3.1 5.3-7.2 5.3C7.6 20.5 4 17.9 4 12S7.6 3.5 12.5 3.5c3.6 0 6 1.6 7 4.6" />
    </svg>
  );
}

export function WhatsAppIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l1.2-3.7A8.2 8.2 0 1 1 8 19.1L4 20Z" />
      <path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.3.4.5v.5c0 .3-.2.7-.6.9-.6.3-1.6.4-3-.2-2-.9-3.8-2.8-4.4-4.6-.4-1.2-.2-1.9.1-2.4Z" />
    </svg>
  );
}
