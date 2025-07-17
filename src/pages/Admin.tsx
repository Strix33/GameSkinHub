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
import { Trash2, Edit, Plus, Users, Shield, Home } from 'lucide-react';
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

export const Admin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
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

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }
    
    if (isAdmin) {
      fetchAccounts();
      fetchUsers();
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">Gaming Accounts</TabsTrigger>
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
                      <SelectItem value="valorant">Valorant</SelectItem>
                      <SelectItem value="csgo">CS:GO</SelectItem>
                      <SelectItem value="minecraft">Minecraft</SelectItem>
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