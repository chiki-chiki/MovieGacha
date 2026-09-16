import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { GET } from "./route";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

function mockListExists(result: { data: unknown; error: unknown }) {
  const maybeSingleMock = vi.fn().mockResolvedValue(result);
  const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
  return { select: vi.fn().mockReturnValue({ eq: eqMock }) };
}

function mockListMovies(result: { data: unknown; error: unknown }) {
  const eqMock = vi.fn().mockResolvedValue(result);
  return { select: vi.fn().mockReturnValue({ eq: eqMock }) };
}

describe("GET /api/lists/[id]/gacha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("リストが存在しない場合は404を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ data: null, error: null }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await GET(undefined as never, { params: { id: "list-1" } });

    expect(response.status).toBe(404);
  });

  it("リスト存在確認でDBエラーの場合は500を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists")
        return mockListExists({ data: null, error: { message: "db error" } }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await GET(undefined as never, { params: { id: "list-1" } });

    expect(response.status).toBe(500);
  });

  it("list_movies取得でDBエラーの場合は500を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ data: { id: "list-1" }, error: null }) as never;
      if (table === "list_movies")
        return mockListMovies({ data: null, error: { message: "db error" } }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await GET(undefined as never, { params: { id: "list-1" } });

    expect(response.status).toBe(500);
  });

  it("リストに映画が1本も無い場合は404を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ data: { id: "list-1" }, error: null }) as never;
      if (table === "list_movies") return mockListMovies({ data: [], error: null }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await GET(undefined as never, { params: { id: "list-1" } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBeTruthy();
  });

  it("映画が1本だけの場合はその1本を返す", async () => {
    const onlyMovie = { id: "movie-1", list_id: "list-1", tmdb_id: 1, title: "映画A" };
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ data: { id: "list-1" }, error: null }) as never;
      if (table === "list_movies")
        return mockListMovies({ data: [onlyMovie], error: null }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await GET(undefined as never, { params: { id: "list-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(onlyMovie);
  });

  it("複数の映画からMath.randomの値に応じて等確率で1本を選出する", async () => {
    const movies = [
      { id: "movie-1", title: "映画A" },
      { id: "movie-2", title: "映画B" },
      { id: "movie-3", title: "映画C" },
      { id: "movie-4", title: "映画D" },
    ];
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ data: { id: "list-1" }, error: null }) as never;
      if (table === "list_movies") return mockListMovies({ data: movies, error: null }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    // Math.random() が 0.5 を返す場合、4件中インデックス2(0.5*4=2)が選ばれるはず
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const response = await GET(undefined as never, { params: { id: "list-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(movies[2]);
  });

  it("Math.randomが0を返す場合は先頭の映画が選ばれる", async () => {
    const movies = [
      { id: "movie-1", title: "映画A" },
      { id: "movie-2", title: "映画B" },
    ];
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ data: { id: "list-1" }, error: null }) as never;
      if (table === "list_movies") return mockListMovies({ data: movies, error: null }) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    vi.spyOn(Math, "random").mockReturnValue(0);

    const response = await GET(undefined as never, { params: { id: "list-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(movies[0]);
  });
});
