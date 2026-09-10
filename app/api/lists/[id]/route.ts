import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
  if (!list) {
    return NextResponse.json({ error: "list not found" }, { status: 404 });
  }

  const { error } = await supabase.from("lists").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
