import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Textbox } from "../Textbox";
import { Caption, Label } from "../../typography";

export interface FormGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  children?: ReactNode;
}

export const FormGroup = forwardRef<HTMLInputElement, FormGroupProps>(
  ({ label, error, disabled, id, className = "", children, ...props }, ref) => {
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
        {children ?? (
          <Textbox ref={ref} id={inputId} hasError={!!error} disabled={disabled} {...props} />
        )}
        {error && <Caption className="text-danger-500">{error}</Caption>}
      </div>
    );
  }
);
