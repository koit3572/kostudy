"use client";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const signIn = async (provider: "github" | "google" | "kakao") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-2xl font-bold">로그인</h1>

      <button
        className="px-4 py-2 bg-gray-900 text-white rounded"
        onClick={() => signIn("github")}
      >
        GitHub 로그인
      </button>

      <button
        className="px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => signIn("google")}
      >
        Google 로그인
      </button>

      <button
        className="px-4 py-2 bg-yellow-400 text-black rounded"
        onClick={() => signIn("kakao")}
      >
        Kakao 로그인
      </button>
    </div>
  );
}
