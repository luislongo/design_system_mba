import { useState, type InputHTMLAttributes } from "react";

const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchInput({
  open: controlledOpen,
  onOpenChange,
  disabled,
  placeholder = "Buscar...",
  className = "",
  ...props
}: SearchInputProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = () => {
    if (disabled) return;
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label="Abrir busca"
        className={[
          "w-10 h-10 flex items-center justify-center rounded-200",
          "transition-colors duration-150",
          disabled
            ? "text-neutral-200 cursor-not-allowed"
            : "text-neutral-400 hover:text-neutral-600 cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SearchIcon />
      </button>
    );
  }

  return (
    <div
      className={[
        "flex items-center gap-200 h-10 px-300 rounded-200 border bg-light-full",
        "transition-colors duration-150",
        disabled
          ? "border-neutral-50 bg-light-800"
          : "border-neutral-200 hover:border-neutral-300 focus-within:border-primary-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label="Fechar busca"
        className="shrink-0 flex items-center text-neutral-400 disabled:text-neutral-200 cursor-pointer disabled:cursor-not-allowed"
        tabIndex={-1}
      >
        <SearchIcon />
      </button>
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        autoFocus
        className={[
          "flex-1 min-w-0 bg-transparent outline-none",
          "font-sans text-sm text-neutral-800 placeholder:text-neutral-400",
          disabled ? "text-neutral-300 placeholder:text-neutral-200 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </div>
  );
}
