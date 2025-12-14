"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  nickname: string;
  discriminator: string;
  avatarUrl: string | null;
}

interface ProfileContextValue {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  setAvatarUrl: (url: string | null) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  /** 최초 1회: 로그인된 유저 프로필 로드 */
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("nickname, discriminator, avatar_url")
        .eq("id", user.id)
        .single();

      if (!data) return;

      setProfile({
        nickname: data.nickname,
        discriminator: data.discriminator,
        avatarUrl: data.avatar_url,
      });
    };

    loadProfile();
  }, []);

  /** avatar만 바꾸는 경우에도 profile 객체를 새로 만듦 */
  const setAvatarUrl = (url: string | null) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            avatarUrl: url,
          }
        : prev
    );
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, setAvatarUrl }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return ctx;
}
