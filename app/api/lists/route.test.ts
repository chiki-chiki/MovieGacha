import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { POST } from "./route";

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
