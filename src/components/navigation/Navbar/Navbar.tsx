import { type ReactNode } from "react";

type Size = "desktop" | "mobile";

export interface NavbarProps {
  children: ReactNode;
  size?: Size;
  className?: string;
}

export function Navbar({ children, size: _size = "desktop", className = "" }: NavbarProps) {
  return (
    <nav
      className={[
        "flex items-end bg-light-full border-b border-neutral-200",
        className,
      ].join(" ")}
    >
      {children}
    </nav>
  );
}
