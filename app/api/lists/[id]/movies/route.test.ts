import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { POST } from "./route";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/lists/list-1/movies", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function mockListExists(list: { id: string } | null) {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: list, error: null });
  const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
  return { select: vi.fn().mockReturnValue({ eq: eqMock }) };
}

function mockInsertMovie(result: { data: unknown; error: unknown }) {
  const singleMock = vi.fn().mockResolvedValue(result);
  const selectMock = vi.fn().mockReturnValue({ single: singleMock });
  return { insert: vi.fn().mockReturnValue({ select: selectMock }) };
}

describe("POST /api/lists/[id]/movies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tmdb_idが数値でない場合は400を返す", async () => {
    const response = await POST(postRequest({ tmdb_id: "abc", title: "サンプル" }), {
      params: { id: "list-1" },
    });
    expect(response.status).toBe(400);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("titleが空の場合は400を返す", async () => {
    const response = await POST(postRequest({ tmdb_id: 1, title: "" }), {
      params: { id: "list-1" },
    });
    expect(response.status).toBe(400);
  });

  it("リストが存在しない場合は404を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists(null) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await POST(postRequest({ tmdb_id: 1, title: "サンプル映画" }), {
      params: { id: "list-1" },
    });

    expect(response.status).toBe(404);
  });

  it("正常な入力の場合は映画をリストに追加して返す", async () => {
    const insertedMovie = {
      id: "movie-1",
      list_id: "list-1",
      tmdb_id: 1,
      title: "サンプル映画",
      poster_path: "/poster.jpg",
      overview: "あらすじ",
      added_at: "2026-09-07T00:00:00.000Z",
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ id: "list-1" }) as never;
      return mockInsertMovie({ data: insertedMovie, error: null }) as never;
    });

    const response = await POST(
      postRequest({
        tmdb_id: 1,
        title: "サンプル映画",
        poster_path: "/poster.jpg",
        overview: "あらすじ",
      }),
      { params: { id: "list-1" } }
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(insertedMovie);
  });

  it("DBエラー時は500を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists({ id: "list-1" }) as never;
      return mockInsertMovie({ data: null, error: { message: "db error" } }) as never;
    });

    const response = await POST(postRequest({ tmdb_id: 1, title: "サンプル映画" }), {
      params: { id: "list-1" },
    });

    expect(response.status).toBe(500);
  });
});
