import { type ReactNode } from "react";

export type SortState = "none" | "ascending" | "descending";

export interface TableHeaderCellProps {
  children?: ReactNode;
  sortable?: boolean;
  sort?: SortState;
  onSort?: () => void;
  className?: string;
}

function SortIcon({ sort }: { sort: SortState }) {
  if (sort === "ascending") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 3L4 8h8L8 3z" fill="#64656A" />
        <path d="M8 13L4 8h8l-4 5z" fill="#C7C8C9" />
      </svg>
    );
  }
  if (sort === "descending") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 3L4 8h8L8 3z" fill="#C7C8C9" />
        <path d="M8 13L4 8h8l-4 5z" fill="#64656A" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3L4 8h8L8 3z" fill="#C7C8C9" />
      <path d="M8 13L4 8h8l-4 5z" fill="#C7C8C9" />
    </svg>
  );
}

export function TableHeaderCell({
  children,
  sortable = false,
  sort = "none",
  onSort,
  className = "",
}: TableHeaderCellProps) {
  const Tag = sortable ? "button" : "div";

  return (
    <Tag
      className={[
        "bg-light-900 border-b border-table-border flex items-center gap-200 px-400 py-300 font-sans text-xs font-base text-neutral-800 text-left",
        sortable ? "cursor-pointer hover:bg-light-800 transition-colors duration-100 select-none" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={sortable ? onSort : undefined}
      type={sortable ? "button" : undefined}
      aria-sort={
        sortable
          ? sort === "ascending"
            ? "ascending"
            : sort === "descending"
            ? "descending"
            : "none"
          : undefined
      }
    >
      {children}
      {sortable && <SortIcon sort={sort} />}
    </Tag>
  );
}
