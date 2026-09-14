import { type SVGProps } from "react";

export function IconDragHandle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <g>
<path d="M20 9H4V11H20V9ZM4 15H20V13H4V15Z" fill="currentColor"/>
</g>
    </svg>
  );
}
