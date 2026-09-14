import { type InputHTMLAttributes } from "react";
import { Label } from "../../typography";

const CalendarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden
    className="shrink-0 text-neutral-600"
  >
    <rect x="1" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="0" width="1.5" height="4" rx="0.75" fill="currentColor" />
    <rect x="12" y="0" width="1.5" height="4" rx="0.75" fill="currentColor" />
    <rect x="2" y="7" width="14" height="1.5" fill="currentColor" />
  </svg>
);

interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hasError?: boolean;
}

function DateField({ label, hasError = false, disabled, id, className = "", ...props }: DateFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-100">
      <Label
        htmlFor={inputId}
        className={disabled ? "text-neutral-300" : "text-neutral-600"}
      >
        {label}
      </Label>
      <div
        className={[
          "flex items-center gap-200 w-4000 px-300 py-[10px] rounded-100 border",
          "bg-light-full transition-colors duration-150",
          hasError
            ? "border-danger-500"
            : disabled
            ? "border-neutral-50 bg-light-800"
            : "border-neutral-200 hover:border-neutral-300 focus-within:border-primary-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <CalendarIcon />
        <input
          type="date"
          id={inputId}
          disabled={disabled}
          className={[
            "flex-1 min-w-0 bg-transparent outline-none",
            "font-sans text-sm text-neutral-600",
            "[&::-webkit-calendar-picker-indicator]:hidden",
            disabled ? "text-neutral-300 cursor-not-allowed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
      </div>
    </div>
  );
}

export interface DateRangeInputProps {
  startLabel?: string;
  endLabel?: string;
  startValue?: string;
  endValue?: string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DateRangeInput({
  startLabel = "Data Início",
  endLabel = "Data Fim",
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled,
  className = "",
}: DateRangeInputProps) {
  return (
    <div className={["flex items-center gap-200", className].filter(Boolean).join(" ")}>
      <DateField
        label={startLabel}
        value={startValue}
        onChange={(e) => onStartChange?.(e.target.value)}
        disabled={disabled}
      />
      <span
        className="font-sans text-sm text-neutral-600 self-end pb-[10px]"
        aria-hidden
      >
        —
      </span>
      <DateField
        label={endLabel}
        value={endValue}
        onChange={(e) => onEndChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
