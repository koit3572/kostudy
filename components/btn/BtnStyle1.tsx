"use client";

import { ButtonHTMLAttributes } from "react";

interface BtnStyle1Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function BtnStyle1({
  children,
  className = "",
  disabled,
  ...props
}: BtnStyle1Props) {
  return (
    <button
      disabled={disabled}
      {...props}
      className={`
        w-full rounded-xl px-4 py-3
        text-white text-sm font-medium
        bg-gradient-to-br from-blue-500 to-violet-500
        hover:from-blue-600 hover:to-violet-600
        transition
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
