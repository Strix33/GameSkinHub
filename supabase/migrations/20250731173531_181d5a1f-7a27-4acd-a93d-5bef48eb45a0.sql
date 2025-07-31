-- Fix RLS policy for admins to delete sell requests
CREATE POLICY "Admins can delete sell requests" 
ON public.sell_requests 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));