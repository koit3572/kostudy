/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Google
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Kakao
      { protocol: "https", hostname: "k.kakaocdn.net" },
      { protocol: "https", hostname: "t1.kakaocdn.net" },
      { protocol: "https", hostname: "img1.kakaocdn.net" },
      { protocol: "https", hostname: "img2.kakaocdn.net" },
      { protocol: "https", hostname: "dn.kakaocdn.net" },
      // Supabase Storage (중요)
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
