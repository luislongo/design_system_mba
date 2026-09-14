import { type ReactNode } from "react";

export interface TableHeaderRowProps {
  children: ReactNode;
  className?: string;
}

export function TableHeaderRow({ children, className = "" }: TableHeaderRowProps) {
  return (
    <div
      className={["bg-light-900 flex items-stretch", className].join(" ")}
      role="row"
    >
      {children}
    </div>
  );
}
