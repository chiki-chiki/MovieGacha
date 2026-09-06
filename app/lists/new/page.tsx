"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { List, ListMovie } from "@/lib/types";
import MovieSearchAndAdd from "@/components/MovieSearchAndAdd";

export default function NewListPage() {
  const [name, setName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<List | null>(null);
  const [addedMovies, setAddedMovies] = useState<ListMovie[]>([]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, creator_name: creatorName }),
      });
      if (!res.ok) throw new Error("リストの作成に失敗しました");
      setList(await res.json());
    } catch {
      setError("リストの作成に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  if (!list) {
    return (
      <main className="container">
        <h1>リストを作成</h1>
        <form onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="name">リスト名</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="creatorName">あなたの表示名</label>
            <input
              id="creatorName"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={creating}>
            {creating ? "作成中..." : "作成する"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>{list.name}</h1>
      <p>映画をTMDBで検索してリストに追加しましょう。</p>

      <MovieSearchAndAdd
        listId={list.id}
        onAdded={(movie) => setAddedMovies((prev) => [...prev, movie])}
      />

      <h2>追加済みの映画({addedMovies.length}本)</h2>
      <ul className="card-list">
        {addedMovies.map((movie) => (
          <li key={movie.id} className="card">
            {movie.poster_path && (
              <img
                className="poster"
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
              />
            )}
            <div className="card-body">
              <h3>{movie.title}</h3>
            </div>
          </li>
        ))}
      </ul>

      <Link href="/lists">
        <button type="button">完了してリスト一覧へ</button>
      </Link>
    </main>
  );
}
