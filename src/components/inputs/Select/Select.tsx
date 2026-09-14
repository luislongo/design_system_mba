import { type SelectHTMLAttributes, type ReactNode } from "react";

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface SelectOptionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options?: SelectOptionItem[];
  children?: ReactNode;
}

export function Select({
  hasError = false,
  disabled,
  options,
  children,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className={["relative w-full", className].join(" ")}>
      <select
        disabled={disabled}
        className={[
          "appearance-none w-full h-10 px-400 pr-1000 rounded-200 border outline-none",
          "font-sans text-sm text-neutral-800 bg-light-full cursor-pointer",
          "transition-colors duration-150",
          hasError
            ? "border-danger-500 focus:border-danger-500"
            : "border-neutral-200 hover:border-neutral-300 focus:border-primary-500",
          disabled
            ? "bg-light-800 border-neutral-50 text-neutral-300 cursor-not-allowed"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute right-400 top-1/2 -translate-y-1/2",
          disabled ? "text-neutral-200" : "text-neutral-600",
        ].join(" ")}
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
}
