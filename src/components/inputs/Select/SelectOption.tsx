import { type ButtonHTMLAttributes } from "react";

export interface SelectOptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  label: string;
  selected?: boolean;
}

export function SelectOption({
  value,
  label,
  selected,
  disabled,
  onClick,
  className = "",
  ...props
}: SelectOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      data-value={value}
      onClick={onClick}
      className={[
        "w-full h-10 px-400 text-left text-sm font-sans",
        "transition-colors duration-100 outline-none",
        disabled
          ? "text-neutral-300 bg-light-800 cursor-not-allowed"
          : [
              "text-neutral-800 cursor-pointer",
              selected ? "bg-primary-50" : "bg-light-full hover:bg-light-800",
            ].join(" "),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {label}
    </button>
  );
}
