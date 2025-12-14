import "./globals.css";
import { ProfileProvider } from "@/components/profile/ProfileContext";
import HomeHeader from "@/components/layout/HomeHeader";
import StudyTimerClient from "@/components/StudyTimerClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <StudyTimerClient />
        <ProfileProvider>
          {/* 고정 헤더 */}
          <HomeHeader />

          {/* 헤더 높이만큼 여백 */}
          <main className="pt-12">{children}</main>
        </ProfileProvider>
      </body>
    </html>
  );
}
