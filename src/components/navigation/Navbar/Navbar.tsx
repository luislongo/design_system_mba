import { type ReactNode } from "react";

export interface NavbarProps {
  children: ReactNode;
  className?: string;
}

export function Navbar({ children, className = "" }: NavbarProps) {
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
