import { afterEach, describe, expect, it, vi } from "vitest";
import { searchTmdbMovies } from "./tmdb";

describe("searchTmdbMovies", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.TMDB_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.TMDB_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it("TMDB_API_KEYが未設定の場合はエラーを投げる", async () => {
    delete process.env.TMDB_API_KEY;

    await expect(searchTmdbMovies("query")).rejects.toThrow(
      "TMDB_API_KEY must be set"
    );
  });

  it("TMDBのレスポンスをTmdbSearchResult[]に変換する", async () => {
    process.env.TMDB_API_KEY = "dummy-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            title: "サンプル映画",
            poster_path: "/poster.jpg",
            overview: "あらすじ",
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const results = await searchTmdbMovies("サンプル");

    expect(results).toEqual([
      {
        tmdb_id: 1,
        title: "サンプル映画",
        poster_path: "/poster.jpg",
        overview: "あらすじ",
      },
    ]);
  });

  it("クエリ・言語・APIキーをリクエストパラメータに含める", async () => {
    process.env.TMDB_API_KEY = "dummy-key";
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchTmdbMovies("スパイダーマン");

    const calledUrl = fetchMock.mock.calls[0][0] as URL;
    expect(calledUrl.searchParams.get("query")).toBe("スパイダーマン");
    expect(calledUrl.searchParams.get("language")).toBe("ja-JP");
    expect(calledUrl.searchParams.get("api_key")).toBe("dummy-key");
  });

  it("TMDBが異常系レスポンスを返した場合はエラーを投げる", async () => {
    process.env.TMDB_API_KEY = "dummy-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }) as unknown as typeof fetch;

    await expect(searchTmdbMovies("query")).rejects.toThrow(
      "TMDB search request failed: 401"
    );
  });
});
