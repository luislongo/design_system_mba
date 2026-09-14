import { type ReactNode } from "react";

export type TableCellAlignment = "left" | "center" | "right";

export interface TableRowCellProps {
  children?: ReactNode;
  alignment?: TableCellAlignment;
  className?: string;
}

const ALIGNMENT_CLASSES: Record<TableCellAlignment, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export function TableRowCell({
  children,
  alignment = "left",
  className = "",
}: TableRowCellProps) {
  return (
    <div
      className={[
        "bg-light-full border-b border-table-border flex items-center px-400 py-300 font-sans text-sm font-base text-neutral-800 overflow-hidden min-w-0",
        ALIGNMENT_CLASSES[alignment],
        className,
      ].join(" ")}
      role="cell"
    >
      {children}
    </div>
  );
}
