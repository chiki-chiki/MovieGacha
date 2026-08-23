import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MovieGacha",
  description: "映画リストからランダムに1本を選ぶガチャアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
