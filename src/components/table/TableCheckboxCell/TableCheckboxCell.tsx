import { type InputHTMLAttributes } from "react";
import { Checkbox } from "../../inputs/Checkbox";

export interface TableCheckboxCellProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function TableCheckboxCell({ className = "", ...props }: TableCheckboxCellProps & { className?: string }) {
  return (
    <div
      className={["bg-light-full border-b border-[#e0e4e9] flex items-center justify-center px-400 py-300 w-[56px] shrink-0", className].join(" ")}
      role="cell"
    >
      <Checkbox {...props} />
    </div>
  );
}
