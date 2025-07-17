-- Update the image URLs to null so we use the fallback images from assets
UPDATE public.gaming_accounts SET image_url = NULL;

-- Give you admin role
INSERT INTO public.user_roles (user_id, role) 
VALUES ('643ea2e3-9cef-4a93-9c63-40a8f06ea546', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;