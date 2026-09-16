import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { DELETE } from "./route";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

function deleteRequest() {
  return new NextRequest("http://localhost/api/lists/list-1/movies/movie-1", {
    method: "DELETE",
  });
}

function mockMovieExists(movie: { id: string } | null) {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: movie, error: null });
  const eqMock2 = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
  const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
  return { select: vi.fn().mockReturnValue({ eq: eqMock1 }) };
}

function mockDeleteMovie(result: { error: unknown }) {
  const eqMock2 = vi.fn().mockResolvedValue(result);
  const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
  return { delete: vi.fn().mockReturnValue({ eq: eqMock1 }) };
}

describe("DELETE /api/lists/[id]/movies/[movieId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("存在しないmovieIdの場合は404を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "list_movies") return mockMovieExists(null) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await DELETE(deleteRequest(), {
      params: { id: "list-1", movieId: "movie-1" },
    });

    expect(response.status).toBe(404);
  });

  it("存在するレコードの場合は削除して204を返す", async () => {
    const deleteMock = mockDeleteMovie({ error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "list_movies") {
        // 1回目は存在確認のselect、2回目は削除のdeleteとして呼ばれる
        return {
          ...mockMovieExists({ id: "movie-1" }),
          ...deleteMock,
        } as never;
      }
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await DELETE(deleteRequest(), {
      params: { id: "list-1", movieId: "movie-1" },
    });

    expect(response.status).toBe(204);
    expect(deleteMock.delete).toHaveBeenCalled();
    const eqCall1 = deleteMock.delete().eq;
    expect(eqCall1).toHaveBeenCalledWith("id", "movie-1");
    expect(eqCall1("id", "movie-1").eq).toHaveBeenCalledWith("list_id", "list-1");
  });

  it("存在確認時にDBエラーの場合は500を返す", async () => {
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db error" } });
    const eqMock2 = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: eqMock1 }),
    } as never);

    const response = await DELETE(deleteRequest(), {
      params: { id: "list-1", movieId: "movie-1" },
    });

    expect(response.status).toBe(500);
  });

  it("削除時にDBエラーの場合は500を返す", async () => {
    const deleteMock = mockDeleteMovie({ error: { message: "db error" } });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "list_movies") {
        return {
          ...mockMovieExists({ id: "movie-1" }),
          ...deleteMock,
        } as never;
      }
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await DELETE(deleteRequest(), {
      params: { id: "list-1", movieId: "movie-1" },
    });

    expect(response.status).toBe(500);
  });
});
