import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { GET, POST } from "./route";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/lists", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/lists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("nameが空の場合は400を返す", async () => {
    const response = await POST(postRequest({ name: "", creator_name: "太郎" }));

    expect(response.status).toBe(400);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("creator_nameが空の場合は400を返す", async () => {
    const response = await POST(
      postRequest({ name: "おすすめ映画", creator_name: "" })
    );

    expect(response.status).toBe(400);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("正常な入力の場合はリストを作成して返す", async () => {
    const insertedList = {
      id: "list-1",
      name: "おすすめ映画",
      creator_name: "太郎",
      created_at: "2026-09-07T00:00:00.000Z",
    };
    const singleMock = vi
      .fn()
      .mockResolvedValue({ data: insertedList, error: null });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as never);

    const response = await POST(
      postRequest({ name: "おすすめ映画", creator_name: "太郎" })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(supabase.from).toHaveBeenCalledWith("lists");
    expect(insertMock).toHaveBeenCalledWith({
      name: "おすすめ映画",
      creator_name: "太郎",
    });
    expect(body).toEqual(insertedList);
  });

  it("DBエラー時は500を返す", async () => {
    const singleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db error" } });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    vi.mocked(supabase.from).mockReturnValue({ insert: insertMock } as never);

    const response = await POST(
      postRequest({ name: "おすすめ映画", creator_name: "太郎" })
    );

    expect(response.status).toBe(500);
  });
});

describe("GET /api/lists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("リストが無い場合は空配列を返す", async () => {
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as never);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.lists).toEqual([]);
  });

  it("リストをmovie_count付きで、作成日時の降順で返す", async () => {
    const rows = [
      {
        id: "list-2",
        name: "新しいリスト",
        creator_name: "花子",
        created_at: "2026-09-08T00:00:00.000Z",
        list_movies: [{ count: 3 }],
      },
      {
        id: "list-1",
        name: "古いリスト",
        creator_name: "太郎",
        created_at: "2026-09-01T00:00:00.000Z",
        list_movies: [{ count: 0 }],
      },
    ];
    const orderMock = vi.fn().mockResolvedValue({ data: rows, error: null });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as never);

    const response = await GET();
    const body = await response.json();

    expect(supabase.from).toHaveBeenCalledWith("lists");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(body.lists).toEqual([
      {
        id: "list-2",
        name: "新しいリスト",
        creator_name: "花子",
        created_at: "2026-09-08T00:00:00.000Z",
        movie_count: 3,
      },
      {
        id: "list-1",
        name: "古いリスト",
        creator_name: "太郎",
        created_at: "2026-09-01T00:00:00.000Z",
        movie_count: 0,
      },
    ]);
  });

  it("DBエラー時は500を返す", async () => {
    const orderMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db error" } });
    const selectMock = vi.fn().mockReturnValue({ order: orderMock });
    vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as never);

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
