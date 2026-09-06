"use client";

import { useState } from "react";
import Link from "next/link";
import type { ListMovie } from "@/lib/types";

export default function GachaPage({ params }: { params: { id: string } }) {
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState<ListMovie | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDraw() {
    setDrawing(true);
    setError(null);
    setResult(null);
    try {
      const [res] = await Promise.all([
        fetch(`/api/lists/${params.id}/gacha`),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      if (!res.ok) throw new Error("ガチャに失敗しました");
      setResult(await res.json());
    } catch {
      setError("ガチャに失敗しました");
    } finally {
      setDrawing(false);
    }
  }

  return (
    <main className="container">
      <h1>ガチャを引く</h1>

      <button type="button" onClick={handleDraw} disabled={drawing}>
        {drawing ? "抽選中..." : "ガチャを引く"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="card gacha-result">
          {result.poster_path && (
            <img
              className="poster"
              src={`https://image.tmdb.org/t/p/w300${result.poster_path}`}
              alt={result.title}
            />
          )}
          <div className="card-body">
            <h2>{result.title}</h2>
            <p>{result.overview}</p>
          </div>
        </div>
      )}

      <p>
        <Link href="/lists">リスト一覧に戻る</Link>
      </p>
    </main>
  );
}
