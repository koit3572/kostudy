"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const process = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        router.push("/");
        return;
      }

      const email = user.email;
      const meta = user.user_metadata;

      const draftName =
        meta.full_name ?? meta.name ?? meta.preferred_username ?? "사용자";

      const rawAvatar =
        meta.avatar_url ?? meta.picture ?? meta.profile_image_url ?? null;

      const avatarUrl = rawAvatar?.startsWith("http://")
        ? rawAvatar.replace("http://", "https://")
        : rawAvatar;

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email,
          nickname: draftName,
          avatar_url: avatarUrl,
          is_initialized: false,
        });
      }

      router.push("/");
    };

    process();
  }, [router]);

  return (
    <div
      className="
        min-h-[calc(100vh-3.5rem)] pb-14         /* 헤더 제외한 영역 */
        flex items-center justify-center
        bg-slate-50
      "
    >
      <div
        className="
          w-full max-w-sm
          rounded-2xl
          bg-white
          border border-slate-200
          shadow-lg
          px-6 py-8
          text-center
        "
      >
        {/* 로딩 스피너 */}
        <div className="mb-4 flex justify-center">
          <div
            className="
              w-10 h-10
              rounded-full
              border-4 border-slate-200
              border-t-violet-500
              animate-spin
            "
          />
        </div>

        <p className="text-base font-medium text-slate-800">로그인 처리중…</p>

        <p className="mt-2 text-sm text-slate-500">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
