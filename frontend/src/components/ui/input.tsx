import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-neutral-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            flex h-11 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm 
            placeholder:text-neutral-500 
            focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-600 focus:ring-red-600" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
