import { type LabelHTMLAttributes, type ReactNode } from "react";

export interface TypographyProps {
  children?: ReactNode;
  className?: string;
}

export function H1({ children, className = "" }: TypographyProps) {
  return (
    <h1
      className={["font-sans text-xl leading-none", className].join(" ")}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "" }: TypographyProps) {
  return (
    <h2
      className={["font-sans text-lg leading-none", className].join(" ")}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: TypographyProps) {
  return (
    <h3
      className={["font-sans text-base font-semibold leading-none", className].join(" ")}
    >
      {children}
    </h3>
  );
}

export function Subtitle({ children, className = "" }: TypographyProps) {
  return (
    <p className={["font-sans text-sm leading-none", className].join(" ")}>
      {children}
    </p>
  );
}

export function Body({ children, className = "" }: TypographyProps) {
  return (
    <p className={["font-sans text-xs leading-none", className].join(" ")}>
      {children}
    </p>
  );
}

export function Description({ children, className = "" }: TypographyProps) {
  return (
    <p className={["font-sans text-xs leading-none", className].join(" ")}>
      {children}
    </p>
  );
}

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

export function Label({ children, className = "", ...props }: LabelProps) {
  return (
    <label
      className={["font-sans text-xs leading-none", className].join(" ")}
      {...props}
    >
      {children}
    </label>
  );
}

export function Caption({ children, className = "" }: TypographyProps) {
  return (
    <p className={["font-sans text-xs leading-none", className].join(" ")}>
      {children}
    </p>
  );
}
