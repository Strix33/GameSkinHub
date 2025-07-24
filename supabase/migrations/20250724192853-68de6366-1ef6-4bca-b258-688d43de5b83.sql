-- Create sell requests table
CREATE TABLE public.sell_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  game TEXT NOT NULL,
  price NUMERIC NOT NULL,
  amount_of_skins INTEGER NOT NULL,
  skin_names TEXT[] NOT NULL,
  game_username TEXT NOT NULL,
  game_password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  checker_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.sell_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for sell requests
CREATE POLICY "Users can create their own sell requests" 
ON public.sell_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sell requests" 
ON public.sell_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Checkers can view all pending sell requests" 
ON public.sell_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'checker'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Checkers can update sell requests" 
ON public.sell_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'checker'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all sell requests" 
ON public.sell_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sell_requests_updated_at
BEFORE UPDATE ON public.sell_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();