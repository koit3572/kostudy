"use client";

import { useEffect, useMemo, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { supabase } from "@/lib/supabase/client";

/* ───────── 유틸 ───────── */

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  return cells;
}

function dayColor(level: number) {
  if (level >= 4) return "bg-violet-600";
  if (level === 3) return "bg-violet-500";
  if (level === 2) return "bg-violet-400";
  if (level === 1) return "bg-violet-300";
  return "bg-slate-200";
}

/* ───────── 컴포넌트 ───────── */

export default function StudyCalendarHeatmap() {
  const today = new Date();
  const initialBase = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [base, setBase] = useState(initialBase);
  const [dir, setDir] = useState<"left" | "right">("right");

  const MONTHS_PC = 3;

  /** 🔹 DB에서 가져온 날짜별 level 맵 */
  const [studyMap, setStudyMap] = useState<Record<string, number>>({});

  /* ───────── DB 로드 ───────── */
  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      // 현재 보여지는 월 범위 계산
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + MONTHS_PC, 0);

      const startDate = start.toISOString().slice(0, 10);
      const endDate = end.toISOString().slice(0, 10);

      const { data } = await supabase
        .from("study_daily_logs")
        .select("study_date, level")
        .eq("user_id", auth.user.id)
        .gte("study_date", startDate)
        .lte("study_date", endDate);

      if (!data) return;

      const map: Record<string, number> = {};
      for (const row of data) {
        map[row.study_date] = row.level ?? 0;
      }

      setStudyMap(map);
    };

    load();
  }, [base]);

  /* ───────── 월 계산 ───────── */
  const months = useMemo(() => {
    return Array.from({ length: MONTHS_PC }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        matrix: getMonthMatrix(d.getFullYear(), d.getMonth()),
      };
    });
  }, [base]);

  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white px-5 py-6 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-slate-700">지난 학습 기록</h2>
        <div className="flex-1 h-px bg-slate-200/70" />
      </div>

      {/* 달력 영역 */}
      <div className="relative">
        {/* 좌측 버튼 */}
        <button
          onClick={() => {
            setDir("left");
            setBase(new Date(base.getFullYear(), base.getMonth() - 1, 1));
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 shadow-sm"
        >
          <IoChevronBack />
        </button>

        {/* 우측 버튼 */}
        <button
          onClick={() => {
            setDir("right");
            setBase(new Date(base.getFullYear(), base.getMonth() + 1, 1));
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 shadow-sm"
        >
          <IoChevronForward />
        </button>

        {/* 슬라이드 */}
        <div className="overflow-hidden px-10">
          <div
            key={base.toISOString()}
            className={`flex justify-center gap-5 transition-all duration-300 ease-out ${
              dir === "right" ? "animate-slide-left" : "animate-slide-right"
            }`}
          >
            {months.map((m, idx) => {
              const isCenter = idx === 1;

              return (
                <div
                  key={m.label}
                  className={`space-y-2 transition-all duration-300 ${
                    idx > 0 ? "hidden sm:block" : ""
                  }`}
                >
                  <div
                    className={`rounded-xl p-3 ${
                      isCenter ? "bg-violet-50 shadow-md" : "opacity-70"
                    }`}
                  >
                    <div className="text-xs text-slate-600 text-center font-medium mb-2">
                      {m.label}
                    </div>

                    <div className="grid grid-cols-7 gap-[5px]">
                      {m.matrix.map((day, i) => {
                        if (!day)
                          return (
                            <div
                              key={i}
                              className="w-4 h-4 rounded bg-transparent"
                            />
                          );

                        const dateKey = `${m.year}-${String(
                          m.month + 1
                        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                        const level = studyMap[dateKey] ?? 0;

                        return (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-md ${dayColor(level)}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 bg-slate-200 rounded-sm" />
        <div className="w-3 h-3 bg-violet-300 rounded-sm" />
        <div className="w-3 h-3 bg-violet-400 rounded-sm" />
        <div className="w-3 h-3 bg-violet-500 rounded-sm" />
        <div className="w-3 h-3 bg-violet-600 rounded-sm" />
        <span>More</span>
      </div>
    </section>
  );
}
