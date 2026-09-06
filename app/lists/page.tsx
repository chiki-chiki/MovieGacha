"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { List } from "@/lib/types";

type ListWithCount = List & { movie_count: number };

export default function ListsPage() {
  const [lists, setLists] = useState<ListWithCount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/lists")
      .then((res) => {
        if (!res.ok) throw new Error("リスト一覧の取得に失敗しました");
        return res.json();
      })
      .then((data) => setLists(data.lists))
      .catch(() => setError("リスト一覧の取得に失敗しました"));
  }, []);

  return (
    <main className="container">
      <div className="list-summary">
        <h1>リスト一覧</h1>
        <Link href="/lists/new">
          <button type="button">リストを作成</button>
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!error && lists === null && <p>読み込み中...</p>}
      {lists?.length === 0 && <p>まだリストがありません。</p>}

      <ul className="card-list">
        {lists?.map((list) => (
          <li key={list.id} className="card">
            <div className="card-body">
              <h3>{list.name}</h3>
              <p>
                作成者: {list.creator_name} / {list.movie_count}本収録
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/lists/${list.id}/gacha`}>
                  <button type="button">ガチャを引く</button>
                </Link>
                <Link href={`/lists/${list.id}/edit`}>
                  <button type="button" className="secondary">
                    編集
                  </button>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
