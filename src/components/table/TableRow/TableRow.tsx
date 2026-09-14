import { type ReactNode } from "react";

export interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return (
    <div
      className={["bg-light-full flex items-stretch", className].join(" ")}
      role="row"
    >
      {children}
    </div>
  );
}
