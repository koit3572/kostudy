"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownStyle1Props {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export default function DropdownStyle1({
  trigger,
  children,
  align = "right",
}: DropdownStyle1Props) {
  const [open, setOpen] = useState(false);

  // PC 드롭다운(트리거 + PC 메뉴) 영역 ref
  const ref = useRef<HTMLDivElement>(null);

  // 모바일 Portal 메뉴 영역 ref (중요)
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      const insidePc = !!ref.current && ref.current.contains(target);
      const insideMobile =
        !!mobilePanelRef.current && mobilePanelRef.current.contains(target);

      // PC 영역에도, 모바일 패널에도 속하지 않으면 닫기
      if (!insidePc && !insideMobile) {
        setOpen(false);
      }
    };

    // 모바일은 touchstart가 더 중요
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <>
      {/* 트리거 + PC 드롭다운 */}
      <div ref={ref} className="relative flex items-center">
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setOpen((v) => !v);
            }
          }}
          className="flex items-center cursor-pointer"
        >
          {trigger}
        </div>

        {/* PC */}
        {open && (
          <div
            className={`
              hidden sm:block
              absolute top-full mt-2
              ${align === "right" ? "right-0" : "left-0"}
              w-64
              rounded-xl bg-white
              border border-slate-200
              shadow-xl
              z-50
            `}
          >
            {children}
          </div>
        )}
      </div>

      {/* 모바일 (Portal) */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="sm:hidden fixed inset-0 z-9999">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setOpen(false)}
            />

            <div
              ref={mobilePanelRef}
              className="absolute top-0 right-0 h-full w-64 bg-white shadow-2xl"
            >
              {children}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
