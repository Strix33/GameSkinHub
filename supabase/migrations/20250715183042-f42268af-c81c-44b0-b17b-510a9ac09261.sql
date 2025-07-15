-- Create gaming accounts table
CREATE TABLE public.gaming_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bundle TEXT,
  featured BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skins table for account skins
CREATE TABLE public.account_skins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.gaming_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rarity TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.gaming_accounts(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Enable RLS
ALTER TABLE public.gaming_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for gaming_accounts (public read)
CREATE POLICY "Everyone can view gaming accounts" 
ON public.gaming_accounts 
FOR SELECT 
USING (true);

-- RLS policies for account_skins (public read)
CREATE POLICY "Everyone can view account skins" 
ON public.account_skins 
FOR SELECT 
USING (true);

-- RLS policies for cart_items (user-specific)
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_gaming_accounts_updated_at
BEFORE UPDATE ON public.gaming_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.gaming_accounts (title, game, price, bundle, featured, image_url) VALUES
('Valorant Prime Collection', 'valorant', 89.99, 'Prime Bundle', true, '/valorant-skins.jpg'),
('CS:GO Knife Master', 'csgo', 149.99, 'Knife Collection', true, '/csgo-weapons.jpg'),
('Minecraft Builder Pro', 'minecraft', 29.99, 'Builder Pack', false, '/minecraft-character.jpg'),
('Valorant Phantom Deluxe', 'valorant', 119.99, 'Phantom Bundle', true, '/valorant-skins.jpg'),
('CS:GO AK-47 Elite', 'csgo', 199.99, 'AK-47 Collection', false, '/csgo-weapons.jpg'),
('Minecraft Adventure Plus', 'minecraft', 39.99, 'Adventure Pack', false, '/minecraft-character.jpg');

-- Insert sample skins (fixed version)
INSERT INTO public.account_skins (account_id, name, rarity) 
SELECT 
  ga.id,
  CASE 
    WHEN ga.game = 'valorant' THEN 
      CASE (ROW_NUMBER() OVER (PARTITION BY ga.id ORDER BY ga.id)) % 4
        WHEN 0 THEN 'Phantom Prime'
        WHEN 1 THEN 'Vandal Prime'
        WHEN 2 THEN 'Sheriff Prime'
        ELSE 'Operator Prime'
      END
    WHEN ga.game = 'csgo' THEN
      CASE (ROW_NUMBER() OVER (PARTITION BY ga.id ORDER BY ga.id)) % 3
        WHEN 0 THEN 'Karambit Fade'
        WHEN 1 THEN 'AK-47 Redline'
        ELSE 'AWP Dragon Lore'
      END
    ELSE
      CASE (ROW_NUMBER() OVER (PARTITION BY ga.id ORDER BY ga.id)) % 2
        WHEN 0 THEN 'Diamond Pickaxe'
        ELSE 'Enchanted Sword'
      END
  END as name,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'Legendary'
    WHEN RANDOM() < 0.6 THEN 'Epic'
    ELSE 'Rare'
  END as rarity
FROM public.gaming_accounts ga
CROSS JOIN generate_series(1, 3 + FLOOR(RANDOM() * 5)::int);