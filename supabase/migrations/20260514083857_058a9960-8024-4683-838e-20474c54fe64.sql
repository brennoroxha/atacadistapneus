CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'inmetro-backfill-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--32a622ca-bc0f-4d94-ab79-2e659961ea05.lovable.app/api/public/inmetro-backfill',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYWt6YnN4bG1hendscHR6Y3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQ3OTMsImV4cCI6MjA5NDIxMDc5M30.N_HvrsxTV9z2xtVcBPa5zLj6zqz5WpKddnsj1HLLfXs"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);