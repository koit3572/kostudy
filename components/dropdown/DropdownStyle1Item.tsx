"use client";

import Link from "next/link";

export default function DropdownStyle1Item({
  href,
  onClick,
  icon,
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const content = (
    <div
      className="
        flex items-center gap-3
        px-4 py-3
        text-sm text-slate-700
        hover:bg-slate-50
        cursor-pointer
      "
      onClick={(e) => {
        e.stopPropagation(); // 🔑 모바일 핵심
        onClick?.();
      }}
    >
      {icon && <span className="text-slate-400">{icon}</span>}
      <span>{children}</span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
