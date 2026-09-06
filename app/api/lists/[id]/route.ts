import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id, name, creator_name, created_at")
    .eq("id", params.id)
    .maybeSingle();

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
  if (!list) {
    return NextResponse.json({ error: "list not found" }, { status: 404 });
  }

  const { data: movies, error: moviesError } = await supabase
    .from("list_movies")
    .select()
    .eq("list_id", params.id)
    .order("added_at", { ascending: true });

  if (moviesError) {
    return NextResponse.json({ error: moviesError.message }, { status: 500 });
  }

  return NextResponse.json({ ...list, movies });
}

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
