-- Add ip_address column for rate limiting by IP
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS ip_address text;
