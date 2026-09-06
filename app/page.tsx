import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>MovieGacha</h1>
      <p>映画を布教したい人がリストを作り、迷ったらガチャで1本選ぶアプリ。</p>
      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/lists">
          <button type="button">リストを見る</button>
        </Link>
        <Link href="/lists/new">
          <button type="button" className="secondary">
            リストを作る
          </button>
        </Link>
      </div>
    </main>
  );
}
