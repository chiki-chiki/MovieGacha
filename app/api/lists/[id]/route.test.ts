import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { DELETE } from "./route";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

function deleteRequest() {
  return new NextRequest("http://localhost/api/lists/list-1", {
    method: "DELETE",
  });
}

function mockListExists(list: { id: string } | null) {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: list, error: null });
  const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
  return { select: vi.fn().mockReturnValue({ eq: eqMock }) };
}

function mockDeleteList(result: { error: unknown }) {
  const eqMock = vi.fn().mockResolvedValue(result);
  return { delete: vi.fn().mockReturnValue({ eq: eqMock }) };
}

describe("DELETE /api/lists/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("存在しないlist_idの場合は404を返す", async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") return mockListExists(null) as never;
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await DELETE(deleteRequest(), { params: { id: "list-1" } });

    expect(response.status).toBe(404);
  });

  it("存在するリストの場合は削除して204を返す", async () => {
    const deleteMock = mockDeleteList({ error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") {
        // 1回目は存在確認のselect、2回目は削除のdeleteとして呼ばれる
        return {
          ...mockListExists({ id: "list-1" }),
          ...deleteMock,
        } as never;
      }
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await DELETE(deleteRequest(), { params: { id: "list-1" } });

    expect(response.status).toBe(204);
    expect(deleteMock.delete).toHaveBeenCalled();
    expect(deleteMock.delete().eq).toHaveBeenCalledWith("id", "list-1");
  });

  it("存在確認時にDBエラーの場合は500を返す", async () => {
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: "db error" } });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: eqMock }),
    } as never);

    const response = await DELETE(deleteRequest(), { params: { id: "list-1" } });

    expect(response.status).toBe(500);
  });

  it("削除時にDBエラーの場合は500を返す", async () => {
    const deleteMock = mockDeleteList({ error: { message: "db error" } });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "lists") {
        return {
          ...mockListExists({ id: "list-1" }),
          ...deleteMock,
        } as never;
      }
      throw new Error(`unexpected table: ${table}`);
    });

    const response = await DELETE(deleteRequest(), { params: { id: "list-1" } });

    expect(response.status).toBe(500);
  });
});
