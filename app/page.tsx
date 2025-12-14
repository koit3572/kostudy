"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);
    };

    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">메인 페이지</h1>

      {user ? (
        <p className="mt-4">환영합니다! {user.email}</p>
      ) : (
        <a href="/login" className="underline text-blue-600">
          로그인하기
        </a>
      )}
    </div>
  );
}
