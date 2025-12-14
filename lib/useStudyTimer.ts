"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { getStudyLevel } from "@/lib/studyLevel";

export function useStudyTimer() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;

    const start = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const userId = data.user.id;

      intervalRef.current = setInterval(async () => {
        if (!active) return;

        const today = new Date().toISOString().slice(0, 10);

        // 현재 값 조회
        const { data: row } = await supabase
          .from("study_daily_logs")
          .select("total_minutes")
          .eq("user_id", userId)
          .eq("study_date", today)
          .maybeSingle();

        const prevMinutes = row?.total_minutes ?? 0;
        const nextMinutes = prevMinutes + 1;

        // 저장
        await supabase.from("study_daily_logs").upsert(
          {
            user_id: userId,
            study_date: today,
            total_minutes: nextMinutes,
            level: getStudyLevel(nextMinutes),
          },
          { onConflict: "user_id,study_date" }
        );
      }, 60_000); // 1분
    };

    start();

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
