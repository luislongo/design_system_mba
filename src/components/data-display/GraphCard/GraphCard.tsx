import { type ReactNode } from "react";
import { ProgressTable } from "../../table/ProgressTable";

export interface GraphCardProps {
  titulo?: string;
  children?: ReactNode;
  className?: string;
}

const DEFAULT_DATA = [
  { id: "01", name: "Home Decor Range",             popularity: 60, sales: 45, color: "blue"   as const },
  { id: "02", name: "Disney Princess Pink Bag 18'", popularity: 40, sales: 29, color: "green"  as const },
  { id: "03", name: "Bathroom Essentials",           popularity: 25, sales: 18, color: "purple" as const },
  { id: "04", name: "Apple Smartwatches",            popularity: 35, sales: 25, color: "orange" as const },
];

export function GraphCard({ titulo = "Vendas", children, className = "" }: GraphCardProps) {
  return (
    <div
      className={[
        "flex flex-col gap-600 p-400 rounded-400 bg-light-full",
        className,
      ].join(" ")}
    >
      <span className="font-sans font-semibold text-lg text-[#05004e] whitespace-nowrap">
        {titulo}
      </span>

      <div className="flex flex-col flex-1 min-h-0 w-full overflow-y-auto">
        {children ?? <ProgressTable data={DEFAULT_DATA} />}
      </div>
    </div>
  );
}
