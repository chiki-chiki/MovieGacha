import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { searchTmdbMovies } from "@/lib/tmdb";
import { GET } from "./route";

vi.mock("@/lib/tmdb", () => ({
  searchTmdbMovies: vi.fn(),
}));

describe("GET /api/tmdb/search", () => {
  it("queryパラメータが無い場合は400を返す", async () => {
    const request = new NextRequest("http://localhost/api/tmdb/search");

    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(searchTmdbMovies).not.toHaveBeenCalled();
  });

  it("queryパラメータがある場合は検索結果を返す", async () => {
    vi.mocked(searchTmdbMovies).mockResolvedValue([
      { tmdb_id: 1, title: "サンプル映画", poster_path: null, overview: "" },
    ]);
    const request = new NextRequest(
      "http://localhost/api/tmdb/search?query=サンプル"
    );

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(searchTmdbMovies).toHaveBeenCalledWith("サンプル");
    expect(body.results).toHaveLength(1);
    expect(body.results[0].title).toBe("サンプル映画");
  });
});
