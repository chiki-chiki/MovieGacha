-- movie-gacha-spec.md セクション4「データモデル(概略)」に基づくテーブル定義

create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  creator_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists list_movies (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists (id) on delete cascade,
  tmdb_id integer not null,
  title text not null,
  poster_path text,
  overview text not null,
  added_at timestamptz not null default now()
);

create index if not exists list_movies_list_id_idx on list_movies (list_id);
