"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { RiLoginBoxLine, RiLogoutBoxLine, RiUserLine } from "react-icons/ri";
import DropdownStyle1Item from "@/components/dropdown/DropdownStyle1Item";
import DropdownStyle1 from "@/components/dropdown/DropdownStyle1";
import { HOVER_STYLE_1 } from "@/lib/styles";
import { LuClipboardList } from "react-icons/lu";
import { useProfile } from "@/components/profile/ProfileContext";
import Image from "next/image";
import { IoPerson } from "react-icons/io5";

export default function HomeHeader() {
  const [user, setUser] = useState<User | null>(null);
  const { profile } = useProfile();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/70 border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          홈
        </Link>

        <div className="flex items-center">
          {!user ? (
            <Link
              href="/auth/login"
              className={`w-8 h-8 flex items-center justify-center ${HOVER_STYLE_1}`}
            >
              <RiLoginBoxLine className="w-5 h-5" />
            </Link>
          ) : (
            <DropdownStyle1
              trigger={
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                  {profile?.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt="profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IoPerson className="w-[60%] h-[60%] text-slate-300" />
                  )}
                </div>
              }
            >
              <div className="px-4 py-3 border-b">
                <div className="text-sm font-medium">
                  {profile?.nickname ?? "사용자"}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>

              <DropdownStyle1Item href="/profile" icon={<RiUserLine />}>
                프로필
              </DropdownStyle1Item>


              <DropdownStyle1Item onClick={logout} icon={<RiLogoutBoxLine />}>
                로그아웃
              </DropdownStyle1Item>
            </DropdownStyle1>
          )}
        </div>
      </div>
    </header>
  );
}
