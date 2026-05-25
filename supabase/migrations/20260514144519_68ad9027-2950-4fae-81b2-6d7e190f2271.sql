create table if not exists public.watermark_jobs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  image_index int not null,
  original_url text not null,
  new_url text,
  status text not null check (status in ('success','error')),
  error_message text,
  created_at timestamptz not null default now()
);
alter table public.watermark_jobs enable row level security;
create index if not exists watermark_jobs_created_at_idx on public.watermark_jobs (created_at desc);
create index if not exists watermark_jobs_product_id_idx on public.watermark_jobs (product_id);