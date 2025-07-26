-- Add new columns to sell_requests table for email/discord verification options
ALTER TABLE public.sell_requests 
ADD COLUMN verification_method text DEFAULT 'credentials',
ADD COLUMN google_email text,
ADD COLUMN google_password text,
ADD COLUMN discord_username text,
ADD COLUMN checker_discord_username text,
ADD COLUMN discord_friend_request_sent boolean DEFAULT false;