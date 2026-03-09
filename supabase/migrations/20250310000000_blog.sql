-- Blog posts (anyone can read; auth required to create/edit own)
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Post votes (upvote/downvote)
create table if not exists public.post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (1, -1)),
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

-- Comments (anyone can read; auth required to create)
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  content text not null,
  parent_id uuid references public.blog_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_blog_posts_created_at on public.blog_posts(created_at desc);
create index if not exists idx_post_votes_post_id on public.post_votes(post_id);
create index if not exists idx_post_votes_user_id on public.post_votes(user_id);
create index if not exists idx_blog_comments_post_id on public.blog_comments(post_id);
create index if not exists idx_blog_comments_parent_id on public.blog_comments(parent_id);

-- RLS
alter table public.blog_posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.blog_comments enable row level security;

-- blog_posts: public read; auth insert; auth update/delete own
create policy "blog_posts_select" on public.blog_posts for select using (true);
create policy "blog_posts_insert" on public.blog_posts for insert with check (auth.uid() = user_id);
create policy "blog_posts_update" on public.blog_posts for update using (auth.uid() = user_id);
create policy "blog_posts_delete" on public.blog_posts for delete using (auth.uid() = user_id);

-- post_votes: public read; auth insert/update/delete own
create policy "post_votes_select" on public.post_votes for select using (true);
create policy "post_votes_insert" on public.post_votes for insert with check (auth.uid() = user_id);
create policy "post_votes_update" on public.post_votes for update using (auth.uid() = user_id);
create policy "post_votes_delete" on public.post_votes for delete using (auth.uid() = user_id);

-- blog_comments: public read; auth insert; auth update/delete own
create policy "blog_comments_select" on public.blog_comments for select using (true);
create policy "blog_comments_insert" on public.blog_comments for insert with check (auth.uid() = user_id);
create policy "blog_comments_update" on public.blog_comments for update using (auth.uid() = user_id);
create policy "blog_comments_delete" on public.blog_comments for delete using (auth.uid() = user_id);

-- Optional: trigger to keep updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists blog_comments_updated_at on public.blog_comments;
create trigger blog_comments_updated_at
  before update on public.blog_comments
  for each row execute function public.set_updated_at();
