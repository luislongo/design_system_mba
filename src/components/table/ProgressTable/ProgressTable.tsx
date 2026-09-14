import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { TableHeaderRow } from "../TableHeaderRow";
import { TableRow } from "../TableRow";
import { ProgressBar } from "../../data-display/ProgressBar";
import { ProgressChip } from "../../data-display/ProgressChip";

type RowColor = "blue" | "green" | "purple" | "orange";

export interface ProgressTableRow {
  id: string;
  name: string;
  popularity: number;
  sales: number;
  color?: RowColor;
}

export interface ProgressTableProps {
  data: ProgressTableRow[];
  className?: string;
}

const DEFAULT_COLORS: RowColor[] = ["blue", "green", "purple", "orange"];

const CELL_BASE =
  "bg-light-full border-b border-table-border flex items-center px-400 h-1200 font-sans text-sm font-base text-neutral-800 overflow-hidden";
const HEADER_BASE =
  "bg-light-900 border-b border-table-border flex items-center px-400 h-1000 font-sans text-xs font-base text-neutral-800";

const COLUMN_CLASSES = [
  "w-[60px] shrink-0",
  "flex-1 min-w-0",
  "w-[200px] shrink-0",
  "w-[80px] shrink-0 justify-center",
];

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, ProgressTableRow>();

const columns = helper.columns([
  helper.accessor("id", { header: "#" }),
  helper.accessor("name", {
    header: "Name",
    cell: (ctx) => <span className="truncate">{ctx.getValue()}</span>,
  }),
  helper.accessor("popularity", {
    header: "Popularity",
    cell: (ctx) => {
      const color =
        ctx.row.original.color ??
        DEFAULT_COLORS[ctx.row.index % DEFAULT_COLORS.length];
      return <ProgressBar value={ctx.getValue()} color={color} />;
    },
  }),
  helper.accessor("sales", {
    header: "Sales",
    cell: (ctx) => {
      const color =
        ctx.row.original.color ??
        DEFAULT_COLORS[ctx.row.index % DEFAULT_COLORS.length];
      return <ProgressChip value={`${ctx.getValue()}%`} color={color} />;
    },
  }),
]);

export function ProgressTable({ data, className = "" }: ProgressTableProps) {
  const table = useTable({ features, columns, data });

  return (
    <div
      className={["overflow-auto rounded-200 border border-table-border", className].join(" ")}
      role="table"
    >
      <div role="rowgroup">
        {table.getHeaderGroups().map((group) => (
          <TableHeaderRow key={group.id}>
            {group.headers.map((header, idx) => (
              <div
                key={header.id}
                className={[HEADER_BASE, COLUMN_CLASSES[idx] ?? "flex-1"].join(" ")}
                role="columnheader"
              >
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </div>
            ))}
          </TableHeaderRow>
        ))}
      </div>
      <div role="rowgroup">
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell, idx) => (
              <div
                key={cell.id}
                className={[CELL_BASE, COLUMN_CLASSES[idx] ?? "flex-1"].join(" ")}
                role="cell"
              >
                <table.FlexRender cell={cell} />
              </div>
            ))}
          </TableRow>
        ))}
      </div>
    </div>
  );
}
