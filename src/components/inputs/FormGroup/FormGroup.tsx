import { type InputHTMLAttributes } from "react";
import { Textbox } from "../Textbox";
import { Caption, Label } from "../../typography";

export interface FormGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export function FormGroup({
  label,
  error,
  disabled,
  id,
  className = "",
  ...props
}: FormGroupProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={["flex flex-col gap-100", className].join(" ")}>
      {label && (
        <Label
          htmlFor={inputId}
          className={
            error ? "text-danger-500" : disabled ? "text-neutral-300" : "text-neutral-600"
          }
        >
          {label}
        </Label>
      )}
      <Textbox id={inputId} hasError={!!error} disabled={disabled} {...props} />
      {error && (
        <Caption className="text-danger-500">{error}</Caption>
      )}
    </div>
  );
}
