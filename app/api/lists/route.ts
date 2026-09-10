import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("lists")
    .select("id, name, creator_name, created_at, list_movies(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lists = data.map((row) => {
    const { list_movies, ...list } = row as typeof row & {
      list_movies: { count: number }[];
    };
    return { ...list, movie_count: list_movies[0]?.count ?? 0 };
  });

  return NextResponse.json({ lists });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const creatorName =
    typeof body.creator_name === "string" ? body.creator_name.trim() : "";

  if (!name || !creatorName) {
    return NextResponse.json(
      { error: "name and creator_name are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("lists")
    .insert({ name, creator_name: creatorName })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
