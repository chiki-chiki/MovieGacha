"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { List, ListMovie } from "@/lib/types";
import MovieSearchAndAdd from "@/components/MovieSearchAndAdd";

export default function EditListPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [list, setList] = useState<List | null>(null);
  const [movies, setMovies] = useState<ListMovie[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingMovieId, setDeletingMovieId] = useState<string | null>(null);
  const [deletingList, setDeletingList] = useState(false);

  useEffect(() => {
    fetch(`/api/lists/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("リストの取得に失敗しました");
        return res.json();
      })
      .then((data) => {
        setList(data);
        setMovies(data.movies);
      })
      .catch(() => setError("リストの取得に失敗しました"));
  }, [params.id]);

  async function handleDeleteMovie(movieId: string) {
    setDeletingMovieId(movieId);
    setError(null);
    try {
      const res = await fetch(`/api/lists/${params.id}/movies/${movieId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("映画の削除に失敗しました");
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch {
      setError("映画の削除に失敗しました");
    } finally {
      setDeletingMovieId(null);
    }
  }

  async function handleDeleteList() {
    if (!confirm("このリストを削除しますか？元に戻せません。")) return;

    setDeletingList(true);
    setError(null);
    try {
      const res = await fetch(`/api/lists/${params.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("リストの削除に失敗しました");
      router.push("/lists");
    } catch {
      setError("リストの削除に失敗しました");
      setDeletingList(false);
    }
  }

  if (error && !list) {
    return (
      <main className="container">
        <p className="error">{error}</p>
      </main>
    );
  }

  if (!list) {
    return (
      <main className="container">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>{list.name}を編集</h1>
      {error && <p className="error">{error}</p>}

      <h2>収録中の映画({movies.length}本)</h2>
      <ul className="card-list">
        {movies.map((movie) => (
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
              <button
                type="button"
                className="danger"
                onClick={() => handleDeleteMovie(movie.id)}
                disabled={deletingMovieId === movie.id}
              >
                {deletingMovieId === movie.id ? "削除中..." : "削除"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h2>映画を追加</h2>
      <MovieSearchAndAdd
        listId={list.id}
        onAdded={(movie) => setMovies((prev) => [...prev, movie])}
      />

      <h2>リストの削除</h2>
      <button
        type="button"
        className="danger"
        onClick={handleDeleteList}
        disabled={deletingList}
      >
        {deletingList ? "削除中..." : "このリストを削除する"}
      </button>
    </main>
  );
}
