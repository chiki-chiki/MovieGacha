export interface List {
  id: string;
  name: string;
  creator_name: string;
  created_at: string;
}

export interface ListMovie {
  id: string;
  list_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  added_at: string;
}
