type TabSize = "Default" | "Large";

export interface TabProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  size?: TabSize;
  onClick?: () => void;
  className?: string;
}

const sizeMap: Record<TabSize, { text: string; indicator: string }> = {
  Default: { text: "text-sm", indicator: "h-[2px]" },
  Large:   { text: "text-base", indicator: "h-[4px]" },
};

export function Tab({
  label,
  active = false,
  disabled = false,
  size = "Default",
  onClick,
  className = "",
}: TabProps) {
  const { text, indicator } = sizeMap[size];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex flex-col gap-100",
        "font-sans transition-colors duration-100",
        "focus-visible:outline-none",
        "disabled:pointer-events-none",
        text,
        disabled
          ? "text-neutral-400 cursor-not-allowed"
          : active
          ? "text-neutral-800 cursor-pointer"
          : "text-neutral-800 hover:text-neutral-600 cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="leading-none">{label}</span>
      <span
        aria-hidden
        className={[
          "block w-full",
          indicator,
          active
            ? disabled
              ? "bg-neutral-50"
              : "bg-primary-500"
            : "bg-transparent",
        ].join(" ")}
      />
    </button>
  );
}
