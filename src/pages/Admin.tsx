import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Users, Shield, Home, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AccountData } from '@/types/database';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
}

interface UserWithRole {
  profile: Profile;
  role: string;
}

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
  checker_id: string | null;
  created_at: string;
  updated_at: string;
  checked_at: string | null;
  profiles?: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<AccountData | null>(null);
  const [newAccount, setNewAccount] = useState({
    title: '',
    game: '',
    price: '',
    bundle: '',
    image_url: '',
    featured: false
  });
  const [newGame, setNewGame] = useState({
    name: '',
    default_image: '',
    email_required: false
  });
  const [skinNames, setSkinNames] = useState<string[]>(['']);
  
  const addSkinName = () => {
    setSkinNames([...skinNames, '']);
  };
  
  const removeSkinName = (index: number) => {
    if (skinNames.length > 1) {
      setSkinNames(skinNames.filter((_, i) => i !== index));
    }
  };
  
  const updateSkinName = (index: number, value: string) => {
    const updated = [...skinNames];
    updated[index] = value;
    setSkinNames(updated);
  };

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }
    
    if (isAdmin) {
      fetchAccounts();
      fetchUsers();
      fetchSellRequests();
      fetchGames();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('gaming_accounts')
        .select(`
          *,
          skins:account_skins(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .maybeSingle();
          
          return {
            profile,
            role: roleData?.role || 'user'
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSellRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sell_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellRequests(data || []);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sell requests",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('gaming_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Account deleted successfully"
      });
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    }
  };

  const handleCreateAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('gaming_accounts')
        .insert({
          title: newAccount.title,
          game: newAccount.game,
          price: parseFloat(newAccount.price),
          bundle: newAccount.bundle || null,
          image_url: newAccount.image_url || null,
          featured: newAccount.featured
        })
        .select()
        .single();

      if (error) throw error;

      // Create skins for the account if any skin names are provided
      const validSkinNames = skinNames.filter(name => name.trim() !== '');
      if (validSkinNames.length > 0) {
        const skinData = validSkinNames.map(name => ({
          account_id: data.id,
          name: name.trim(),
          rarity: null
        }));

        const { error: skinsError } = await supabase
          .from('account_skins')
          .insert(skinData);

        if (skinsError) throw skinsError;
      }

      toast({
        title: "Success",
        description: "Account created successfully"
      });
      
      setNewAccount({
        title: '',
        game: '',
        price: '',
        bundle: '',
        image_url: '',
        featured: false
      });
      setSkinNames(['']);
      
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role if not 'user'
      if (newRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole as any
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "User role updated successfully"
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to fetch games",
        variant: "destructive"
      });
    }
  };

  const handleCreateGame = async () => {
    try {
      if (!newGame.name.trim()) {
        toast({
          title: "Error",
          description: "Game name is required",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('games')
        .insert({
          name: newGame.name.toLowerCase(),
          default_image: newGame.default_image || null,
          email_required: newGame.email_required
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game created successfully"
      });
      
      setNewGame({
        name: '',
        default_image: '',
        email_required: false
      });
      
      fetchGames();
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create game",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Game deleted successfully"
      });
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Failed to delete game",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSellRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('sell_requests')
        .update({ 
          status,
          checker_id: user?.id,
          checked_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Request ${status} successfully`
      });
      
      fetchSellRequests();
    } catch (error) {
      console.error('Error updating sell request:', error);
      toast({
        title: "Error",
        description: "Failed to update sell request",
        variant: "destructive"
      });
    }
  };

  if (roleLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Gaming Accounts</TabsTrigger>
          <TabsTrigger value="games">Game Management</TabsTrigger>
          <TabsTrigger value="sell-requests">Sell Requests</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAccount.title}
                    onChange={(e) => setNewAccount({ ...newAccount, title: e.target.value })}
                    placeholder="Account title"
                  />
                </div>
                <div>
                  <Label htmlFor="game">Game</Label>
                  <Select value={newAccount.game} onValueChange={(value) => setNewAccount({ ...newAccount, game: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game" />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.name.toLowerCase()}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newAccount.price}
                    onChange={(e) => setNewAccount({ ...newAccount, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="bundle">Bundle (Optional)</Label>
                  <Input
                    id="bundle"
                    value={newAccount.bundle}
                    onChange={(e) => setNewAccount({ ...newAccount, bundle: e.target.value })}
                    placeholder="Bundle name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="image_url">Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  value={newAccount.image_url}
                  onChange={(e) => setNewAccount({ ...newAccount, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newAccount.featured}
                  onChange={(e) => setNewAccount({ ...newAccount, featured: e.target.checked })}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
              
              <div>
                <Label>Skin Names</Label>
                <div className="space-y-2">
                  {skinNames.map((skinName, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={skinName}
                        onChange={(e) => updateSkinName(index, e.target.value)}
                        placeholder={`Skin ${index + 1} name`}
                      />
                      {skinNames.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSkinName(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSkinName}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skin
                  </Button>
                </div>
              </div>
              
              <Button onClick={handleCreateAccount} className="w-full">
                Create Account
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{account.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {account.game} • ${account.price} • {account.skins.length} skins
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAccount(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Game
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add up to 7 games to the navigation bar
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="game-name">Game Name *</Label>
                  <Input
                    id="game-name"
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    placeholder="e.g., Fortnite"
                  />
                </div>
                <div>
                  <Label htmlFor="default-image">Default Image URL</Label>
                  <Input
                    id="default-image"
                    value={newGame.default_image}
                    onChange={(e) => setNewGame({ ...newGame, default_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email-required"
                  checked={newGame.email_required}
                  onChange={(e) => setNewGame({ ...newGame, email_required: e.target.checked })}
                />
                <Label htmlFor="email-required">Email Required for Sell Requests</Label>
              </div>
              
              <Button onClick={handleCreateGame} className="w-full">
                Add Game
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Games ({games.length}/7)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {games.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold capitalize">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Email Required: {game.email_required ? 'Yes' : 'No'}
                      </p>
                      {game.default_image && (
                        <p className="text-xs text-muted-foreground">
                          Image: {game.default_image}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {games.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No games created</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sell-requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Approved Requests</CardTitle>
              <p className="text-sm text-muted-foreground">Checker-approved requests for admin review and deletion</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellRequests.filter(req => req.status === 'approved').map((request) => (
                  <div key={request.id} className="group relative overflow-hidden border border-primary/20 rounded-xl p-6 space-y-4 bg-gradient-to-br from-primary/5 via-background to-primary/5 hover:shadow-lg transition-all duration-300 hover:border-primary/40 hover:scale-[1.02]">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      APPROVED
                    </div>
                    
                    <div className="flex justify-between items-start pr-20">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200">{request.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>By: {request.profiles?.display_name || request.profiles?.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {request.game.toUpperCase()}
                          </span>
                          <span className="font-bold text-lg text-green-600">${request.price}</span>
                          <span className="text-muted-foreground">{request.amount_of_skins} skins</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {request.checked_at ? new Date(request.checked_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    {/* Credentials Section */}
                    <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">🎮 Username:</p>
                          <p className="font-mono bg-background/80 px-2 py-1 rounded border text-primary">{request.game_username}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">🔐 Password:</p>
                          <p className="font-mono bg-background/80 px-2 py-1 rounded border text-primary">{request.game_password}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="font-medium text-foreground">✨ Skins:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.skin_names.map((skin, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                              {skin}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded text-xs">
                        ✅ Approved by checker
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('sell_requests')
                              .delete()
                              .eq('id', request.id);

                            if (error) {
                              toast({
                                title: "Error",
                                description: "Failed to delete request",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Success",
                                description: "Request deleted successfully",
                              });
                              fetchSellRequests();
                            }
                          } catch (error) {
                            console.error('Error deleting request:', error);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {sellRequests.filter(req => req.status === 'approved').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No approved requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((userWithRole) => (
                  <div key={userWithRole.profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">
                        {userWithRole.profile.display_name || userWithRole.profile.email}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userWithRole.profile.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(userWithRole.profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        userWithRole.role === 'admin' ? 'bg-red-100 text-red-800' :
                        userWithRole.role === 'checker' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userWithRole.role}
                      </span>
                      <Select
                        value={userWithRole.role}
                        onValueChange={(value) => handleUpdateUserRole(userWithRole.profile.user_id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="checker">Checker</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};