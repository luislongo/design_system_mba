import {
  useState,
  useRef,
  useEffect,
  useId,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { MegaSelectOption } from "./MegaSelectOption";

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface MegaSelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MegaSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: MegaSelectItem[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MegaSelect({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  disabled,
  className = "",
  ...props
}: MegaSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const enabledIndexes = options.flatMap((o, i) => (o.disabled ? [] : [i]));

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // O painel tem altura máxima com scroll, então a opção ativa por teclado
  // precisa ser trazida à área visível.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openPanel = (from: "start" | "end") => {
    setOpen(true);
    if (enabledIndexes.length === 0) return;
    setActiveIndex(
      selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : from === "start"
        ? enabledIndexes[0]
        : enabledIndexes[enabledIndexes.length - 1]
    );
  };

  const closePanel = (returnFocus: boolean) => {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus) triggerRef.current?.focus();
  };

  const moveActive = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const pos = enabledIndexes.indexOf(activeIndex);
    if (pos === -1) {
      setActiveIndex(dir === 1 ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1]);
      return;
    }
    const next = Math.min(Math.max(pos + dir, 0), enabledIndexes.length - 1);
    setActiveIndex(enabledIndexes[next]);
  };

  const commit = (index: number) => {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange?.(opt.value);
    closePanel(true);
  };

  const toggle = () => {
    if (disabled) return;
    if (open) closePanel(false);
    else openPanel("start");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPanel(e.key === "ArrowUp" ? "end" : "start");
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        e.preventDefault();
        if (enabledIndexes.length > 0) setActiveIndex(enabledIndexes[0]);
        break;
      case "End":
        e.preventDefault();
        if (enabledIndexes.length > 0) setActiveIndex(enabledIndexes[enabledIndexes.length - 1]);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        closePanel(true);
        break;
      case "Tab":
        // não faz preventDefault: o foco deve seguir para o próximo elemento
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={["relative w-full", className].join(" ")} {...props}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open && !disabled}
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
        }
        disabled={disabled}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={[
          "w-full h-10 px-400 flex items-center justify-between rounded-200 border",
          "font-sans text-sm transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
          open && !disabled
            ? "border-primary-500 text-neutral-800 bg-light-full cursor-pointer"
            : disabled
            ? "border-neutral-50 bg-light-800 text-neutral-300 cursor-not-allowed"
            : "border-neutral-200 hover:border-neutral-300 text-neutral-800 bg-light-full cursor-pointer",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={selected ? "text-neutral-800" : "text-neutral-400"}>
          {selected?.label ?? placeholder}
        </span>
        <span className={disabled ? "text-neutral-200" : "text-neutral-600"}>
          <ChevronDownIcon />
        </span>
      </button>

      {open && !disabled && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute top-full z-10 w-full mt-050 border border-neutral-200 rounded-200 bg-light-full overflow-auto max-h-[200px]"
        >
          {options.map((opt, i) => (
            <MegaSelectOption
              key={opt.value}
              id={`${listboxId}-opt-${i}`}
              index={i}
              value={opt.value}
              label={opt.label}
              disabled={opt.disabled}
              active={i === activeIndex}
              selected={i === selectedIndex}
              onClick={() => commit(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
