import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from("lists")
    .delete()
    .eq("id", params.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (data.length === 0) {
    return NextResponse.json({ error: "list not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
