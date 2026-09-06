"use client";

import { FormEvent, useState } from "react";
import type { ListMovie } from "@/lib/types";
import type { TmdbSearchResult } from "@/lib/tmdb";

export default function MovieSearchAndAdd({
  listId,
  onAdded,
}: {
  listId: string;
  onAdded: (movie: ListMovie) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("検索に失敗しました");
      const data = await res.json();
      setResults(data.results);
    } catch {
      setError("検索に失敗しました");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(movie: TmdbSearchResult) {
    setAddingId(movie.tmdb_id);
    setError(null);
    try {
      const res = await fetch(`/api/lists/${listId}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movie),
      });
      if (!res.ok) throw new Error("追加に失敗しました");
      const added: ListMovie = await res.json();
      onAdded(added);
    } catch {
      setError("追加に失敗しました");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="field" style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="映画タイトルで検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={searching}>
          {searching ? "検索中..." : "検索"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="card-list">
        {results.map((movie) => (
          <li key={movie.tmdb_id} className="card">
            {movie.poster_path && (
              <img
                className="poster"
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
              />
            )}
            <div className="card-body">
              <h3>{movie.title}</h3>
              <p>{movie.overview}</p>
              <button
                type="button"
                onClick={() => handleAdd(movie)}
                disabled={addingId === movie.tmdb_id}
              >
                {addingId === movie.tmdb_id ? "追加中..." : "リストに追加"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
