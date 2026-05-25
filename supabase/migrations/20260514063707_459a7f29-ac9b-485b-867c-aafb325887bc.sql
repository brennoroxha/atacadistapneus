insert into storage.buckets (id, name, public) values ('brand-logos', 'brand-logos', true) on conflict (id) do nothing;

create policy "Public read brand-logos"
on storage.objects for select
using (bucket_id = 'brand-logos');