import type { SVGProps } from 'react';

export function TikTokIcon({
  size = 20,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.32a6.34 6.34 0 0 0-.85-.06A6.33 6.33 0 0 0 3 15.58a6.33 6.33 0 0 0 9.87 5.25 6.27 6.27 0 0 0 2.8-5.23V8.81a8.31 8.31 0 0 0 5-1.64v-3.3a8.37 8.37 0 0 1-1.08.82z" />
    </svg>
  );
}
