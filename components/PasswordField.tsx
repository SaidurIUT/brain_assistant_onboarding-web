"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
  { label: "One symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) }
] as const;

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showRequirements?: boolean;
};

export function PasswordField({
  label,
  value,
  onChange,
  showRequirements = false,
  ...inputProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="field">
      <span>{label}</span>
      <div className="password-input-wrap">
        <input
          {...inputProps}
          className={`form-control ${inputProps.className ?? ""}`.trim()}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {showRequirements ? <PasswordRequirements password={value} /> : null}
    </label>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="password-rules" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li className={passed ? "passed" : ""} key={rule.label}>
            <span aria-hidden="true">{passed ? "OK" : "-"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export function passwordMeetsRequirements(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
