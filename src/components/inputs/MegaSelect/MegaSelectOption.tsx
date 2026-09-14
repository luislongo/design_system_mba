export interface MegaSelectOptionProps {
  value: string;
  label: string;
  id?: string;
  index?: number;
  active?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (value: string) => void;
}

export function MegaSelectOption({
  value,
  label,
  id,
  index,
  active = false,
  selected = false,
  disabled,
  onClick,
}: MegaSelectOptionProps) {
  return (
    <button
      type="button"
      role="option"
      id={id}
      data-index={index}
      tabIndex={-1}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onClick?.(value);
      }}
      className={[
        "w-full h-8 px-400 flex items-center font-sans text-sm whitespace-nowrap text-left",
        "transition-colors duration-100 outline-none",
        disabled
          ? "text-neutral-300 cursor-not-allowed"
          : [
              "text-neutral-800 cursor-pointer",
              selected ? "bg-primary-50" : "bg-light-full hover:bg-light-800",
              // cursor de teclado: precisa ser discernível, não só um cinza sutil
              active ? "ring-1 ring-inset ring-primary-500" : "",
            ]
              .filter(Boolean)
              .join(" "),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  );
}
