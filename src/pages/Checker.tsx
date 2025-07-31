import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Home, ClipboardCheck } from 'lucide-react';

interface SellRequest {
  id: string;
  user_id: string;
  title: string;
  game: string;
  price: number;
  amount_of_skins: number;
  skin_names: string[];
  game_username: string;
  game_password: string;
  status: string;
  created_at: string;
  verification_method: string;
  google_email?: string;
  google_password?: string;
  discord_username?: string;
  checker_discord_username?: string;
  discord_friend_request_sent?: boolean;
  profiles?: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export const Checker = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading, isChecker, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkerDiscordUsername, setCheckerDiscordUsername] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!roleLoading && !isChecker && !isAdmin) {
      navigate('/');
      return;
    }

    if (user) {
      fetchPendingRequests();
    }
  }, [user, isChecker, isAdmin, roleLoading, navigate]);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sell_requests')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Error",
          description: "Failed to fetch requests",
          variant: "destructive",
        });
      } else {
        setRequests((data || []) as unknown as SellRequest[]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      const updateData: any = { 
        status: 'approved',
        checker_id: user?.id,
        checked_at: new Date().toISOString()
      };

      // If this is a discord verification, add checker discord username and set friend request flag
      if (request?.verification_method === 'discord' && checkerDiscordUsername[requestId]) {
        updateData.checker_discord_username = checkerDiscordUsername[requestId];
        updateData.discord_friend_request_sent = true;
      }

      const { error } = await supabase
        .from('sell_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error accepting request:', error);
        toast({
          title: "Error",
          description: "Failed to accept request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Request accepted successfully",
        });
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      // Delete the request from database
      const { error } = await supabase
        .from('sell_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Error denying request:', error);
        toast({
          title: "Error",
          description: "Failed to deny request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Denied",
          description: "Request has been denied and removed",
        });
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  if (roleLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isChecker && !isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Checker Dashboard</h1>
        </div>
        <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and approve/deny sell requests from users
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{request.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By: {request.profiles?.display_name || request.profiles?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.game} • ${request.price} • {request.amount_of_skins} skins
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="text-sm bg-muted p-3 rounded space-y-2">
                  <p><strong>Username:</strong> {request.game_username}</p>
                  <p><strong>Password:</strong> {request.game_password}</p>
                  <p><strong>Skins:</strong> {request.skin_names.join(', ')}</p>
                  
                  {/* Show verification method details */}
                  <div className="pt-2 border-t">
                    <p><strong>Verification Method:</strong> {request.verification_method}</p>
                    {request.verification_method === 'email' && (
                      <>
                        <p><strong>Google Email:</strong> {request.google_email}</p>
                        <p><strong>Google Password:</strong> {request.google_password}</p>
                      </>
                    )}
                    {request.verification_method === 'discord' && (
                      <p><strong>Discord Username:</strong> {request.discord_username}</p>
                    )}
                  </div>
                </div>
                
                {/* Discord username input for checker (only if verification method is discord) */}
                {request.verification_method === 'discord' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">
                      Checker Discord Username *
                    </label>
                    <input
                      type="text"
                      placeholder="your_discord#1234"
                      value={checkerDiscordUsername[request.id] || ''}
                      onChange={(e) => setCheckerDiscordUsername({
                        ...checkerDiscordUsername,
                        [request.id]: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your Discord username to send friend request to user
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptRequest(request.id)}
                    disabled={request.verification_method === 'discord' && !checkerDiscordUsername[request.id]?.trim()}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDenyRequest(request.id)}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No pending requests to review</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};