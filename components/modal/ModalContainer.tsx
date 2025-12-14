"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalContainerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalContainer({
  open,
  onClose,
  children,
}: ModalContainerProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div
          className="
            w-full max-w-md
            rounded-2xl
            bg-white
            shadow-2xl
            border border-slate-200
            p-6
            animate-[fadeIn_0.15s_ease-out]
          "
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
