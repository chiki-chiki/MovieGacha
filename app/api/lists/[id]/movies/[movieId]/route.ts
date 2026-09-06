import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; movieId: string } }
) {
  const { data, error } = await supabase
    .from("list_movies")
    .delete()
    .eq("id", params.movieId)
    .eq("list_id", params.id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (data.length === 0) {
    return NextResponse.json(
      { error: "list movie not found" },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
