"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import ModalContainer from "@/components/modal/ModalContainer";
import BtnStyle1 from "@/components/btn/BtnStyle1";
import { useProfile } from "@/components/profile/ProfileContext";
import { IoPerson } from "react-icons/io5";

interface Props {
  open: boolean;
  onClose: () => void;
  email: string;
  nickname: string;
  discriminator: string | null;
  goal: string;
  avatarUrl: string | null;
  onSaved: (v: {
    nickname: string;
    discriminator: string;
    goal: string;
    avatarUrl: string | null;
  }) => void;
}

function randomDiscriminator() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function ProfileEditModal({
  open,
  onClose,
  email,
  nickname: initialNickname,
  discriminator: initialDiscriminator,
  goal: initialGoal,
  onSaved,
}: Props) {
  const { profile, setAvatarUrl } = useProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nickname, setNickname] = useState(initialNickname);
  const [discriminator, setDiscriminator] = useState(
    initialDiscriminator ?? randomDiscriminator()
  );
  const [goal, setGoal] = useState(initialGoal);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNickname(initialNickname);
    setDiscriminator(initialDiscriminator ?? randomDiscriminator());
    setGoal(initialGoal);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setError(null);
  }, [open, initialNickname, initialDiscriminator, initialGoal]);

  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setAvatarFile(null);
      setRemoveAvatar(true);
      return;
    }

    if (!file.type.startsWith("image/")) return;

    setAvatarFile(file);
    setRemoveAvatar(false);
  };

  const uploadAvatar = async (file: File, userId: string) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `${userId}.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) throw new Error("프로필 사진 업로드 실패");

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return `${data.publicUrl}?v=${Date.now()}`;
  };

  const checkDuplicate = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .eq("discriminator", discriminator)
      .neq("email", email)
      .maybeSingle();

    if (data) {
      setError("이미 사용 중인 이름과 번호 조합입니다.");
      return false;
    }
    return true;
  };

  const save = async () => {
    setError(null);

    if (!nickname.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    const ok = await checkDuplicate();
    if (!ok) return;

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let finalAvatarUrl: string | null = profile?.avatarUrl ?? null;

      if (removeAvatar) {
        finalAvatarUrl = null;
      } else if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile, user.id);
      }

      await supabase
        .from("profiles")
        .update({
          nickname,
          discriminator,
          goal,
          avatar_url: finalAvatarUrl,
          is_initialized: true,
        })
        .eq("email", email);

      setAvatarUrl(finalAvatarUrl);

      onSaved({
        nickname,
        discriminator,
        goal,
        avatarUrl: finalAvatarUrl,
      });

      onClose();
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const shownAvatar =
    previewUrl || (removeAvatar ? null : profile?.avatarUrl ?? null);

  return (
    <ModalContainer open={open} onClose={onClose}>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">프로필 설정</h2>
        <p className="text-sm text-slate-500">
          다른 사용자에게 보여질 정보를 설정해요
        </p>
      </div>

      {/* 아바타 */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative">
          {/* 실제 아바타 */}
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
            {shownAvatar ? (
              <Image
                src={shownAvatar}
                alt="avatar"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <IoPerson className="w-[60%] h-[60%] text-slate-300" />
            )}
          </div>

          {/* X 버튼 (overflow 밖) */}
          {(previewUrl || profile?.avatarUrl) && (
            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                setRemoveAvatar(true);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="
                absolute -top-2 -right-3
                w-5 h-5 rounded-full
                bg-black/60 text-white
                text-xs font-bold
                flex items-center justify-center
                hover:bg-black/80
                z-10
              "
            >
              ×
            </button>
          )}
        </div>

        <label
          htmlFor="avatar-upload"
          className="px-4 py-2 rounded-lg border text-sm cursor-pointer"
        >
          사진 변경
        </label>

        <input
          ref={fileInputRef}
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePick}
        />
      </div>

      {/* 이름 */}
      <div className="mb-5 space-y-2">
        <label className="text-sm font-medium text-slate-700">
          사용자 이름
        </label>
        <div className="flex gap-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="이름"
            className="flex-1 rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-violet-300 outline-none"
          />
          <input
            value={discriminator}
            onChange={(e) =>
              setDiscriminator(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            className="w-24 rounded-xl border px-3 py-3 text-sm text-center focus:ring-2 focus:ring-violet-300 outline-none"
          />
        </div>
        <p className="text-xs text-slate-400">
          이름 + 번호 조합은 다른 사용자와 중복될 수 없어요
        </p>
      </div>

      {/* 목표 */}
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-700">나의 목표</label>
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="예: 매일 30분 이상 학습"
          className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-violet-300 outline-none"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <BtnStyle1 onClick={save} disabled={saving} className="w-full py-3">
        {saving ? "저장 중..." : "저장"}
      </BtnStyle1>
    </ModalContainer>
  );
}
