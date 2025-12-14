"use client";

import StudyCalendarHeatmap from "./StudyCalendarHeatmap";
import ProfileEditModal from "@/components/modal/ProfileEditModal";
import { IoPerson, IoSettingsSharp } from "react-icons/io5";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [discriminator, setDiscriminator] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname, discriminator, avatar_url, goal")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setNickname(profile.nickname ?? "사용자");
        setDiscriminator(profile.discriminator);
        setAvatarUrl(profile.avatar_url);
        setGoal(profile.goal ?? "");
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 space-y-6">
      {/* ───────── 프로필 카드 ───────── */}
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-4">
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="profile"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <IoPerson className="w-8 h-8 text-slate-300" />
              )}
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="
                absolute -bottom-1 -right-1
                h-7 w-7 rounded-full
                bg-white border border-slate-200
                flex items-center justify-center
                hover:bg-slate-50
              "
            >
              <IoSettingsSharp className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* 이름 / 이메일 */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-slate-800">
                {nickname}
              </span>
              {discriminator && (
                <span className="text-sm text-slate-400">#{discriminator}</span>
              )}
            </div>
            <div className="text-sm text-slate-500">{email}</div>
          </div>
        </div>

        {/* 목표 */}
        {goal && (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {goal}
          </div>
        )}
      </section>

      {/* ───────── 학습 기록 (확장된 컨테이너에 최적화됨) ───────── */}
      <StudyCalendarHeatmap />

      {/* ───────── 로그아웃 ───────── */}
      <div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            location.href = "/";
          }}
          className="text-sm text-slate-400 hover:text-red-600 transition"
        >
          로그아웃
        </button>
      </div>

      {/* 프로필 수정 모달 */}
      <ProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        email={email}
        nickname={nickname}
        discriminator={discriminator}
        goal={goal}
        avatarUrl={avatarUrl}
        onSaved={(v) => {
          setNickname(v.nickname);
          setDiscriminator(v.discriminator);
          setAvatarUrl(v.avatarUrl);
          setGoal(v.goal);
        }}
      />
    </div>
  );
}
