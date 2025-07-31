import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';

export const Sell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discordNotification, setDiscordNotification] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    price: '',
    amount_of_skins: '',
    game_username: '',
    game_password: '',
    verification_method: 'credentials',
    google_email: '',
    google_password: '',
    discord_username: ''
  });
  
  const [skinNames, setSkinNames] = useState<string[]>(['']);

  // Check for Discord notifications on component mount
  useEffect(() => {
    if (user) {
      checkForDiscordNotifications();
    }
  }, [user]);

  const checkForDiscordNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('sell_requests')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'approved')
        .eq('verification_method', 'discord')
        .eq('discord_friend_request_sent', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking notifications:', error);
        return;
      }

      if (data && data.length > 0 && data[0].checker_discord_username) {
        setDiscordNotification(data[0].checker_discord_username);
      }
    } catch (error) {
      console.error('Error checking Discord notifications:', error);
    }
  };

  // Check if game requires email verification
  const isEmailRequired = (game: string) => {
    return game === 'valorant';
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Validate form
    if (!formData.title || !formData.game || !formData.price || !formData.amount_of_skins || 
        !formData.game_username || !formData.game_password || skinNames.filter(name => name.trim()).length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Additional validation for email-required games
    if (isEmailRequired(formData.game)) {
      if (formData.verification_method === 'email' && (!formData.google_email || !formData.google_password)) {
        toast({
          title: "Error",
          description: "Please provide Google email and password for Valorant accounts",
          variant: "destructive"
        });
        return;
      }
      if (formData.verification_method === 'discord' && !formData.discord_username) {
        toast({
          title: "Error",
          description: "Please provide Discord username for verification",
          variant: "destructive"
        });
        return;
      }
    }

    const filteredSkinNames = skinNames.filter(name => name.trim());
    if (parseInt(formData.amount_of_skins) !== filteredSkinNames.length) {
      toast({
        title: "Error",
        description: "Number of skins must match the amount of skin names provided",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const insertData: any = {
        user_id: user.id,
        title: formData.title,
        game: formData.game,
        price: parseFloat(formData.price),
        amount_of_skins: parseInt(formData.amount_of_skins),
        skin_names: filteredSkinNames,
        game_username: formData.game_username,
        game_password: formData.game_password,
        status: 'pending'
      };

      // Add verification fields for email-required games
      if (isEmailRequired(formData.game)) {
        insertData.verification_method = formData.verification_method;
        if (formData.verification_method === 'email') {
          insertData.google_email = formData.google_email;
          insertData.google_password = formData.google_password;
        } else if (formData.verification_method === 'discord') {
          insertData.discord_username = formData.discord_username;
        }
      }

      const { error } = await supabase
        .from('sell_requests')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your sell request has been submitted for review"
      });

      // Reset form
      setFormData({
        title: '',
        game: '',
        price: '',
        amount_of_skins: '',
        game_username: '',
        game_password: '',
        verification_method: 'credentials',
        google_email: '',
        google_password: '',
        discord_username: ''
      });
      setSkinNames(['']);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit sell request",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-primary">Sell Your Account</h1>
          </div>

          {/* Discord notification */}
          {discordNotification && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-800">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Discord Friend Request Sent!</p>
                    <p className="text-sm">
                      <strong>{discordNotification}</strong> has sent you a Discord friend request. 
                      Please accept the request to proceed with the verification process.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setDiscordNotification(null)}
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Submit Account for Sale</CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below to submit your gaming account for review. 
                A checker will review your submission before it goes live.
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Account Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Premium Valorant Account"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="game">Game *</Label>
                    <Select value={formData.game} onValueChange={(value) => setFormData({...formData, game: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select game" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valorant">Valorant</SelectItem>
                        <SelectItem value="csgo">CS:GO</SelectItem>
                        <SelectItem value="minecraft">Minecraft</SelectItem>
                        <SelectItem value="fortnite">Fortnite</SelectItem>
                        <SelectItem value="pubg">PUBG</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="99.99"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Number of Skins *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      value={formData.amount_of_skins}
                      onChange={(e) => setFormData({...formData, amount_of_skins: e.target.value})}
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Skin Names *</Label>
                  <div className="space-y-2">
                    {skinNames.map((skin, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={skin}
                          onChange={(e) => updateSkinName(index, e.target.value)}
                          placeholder={`Skin ${index + 1} name`}
                          className="flex-1"
                        />
                        {skinNames.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
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
                      onClick={addSkinName}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Skin
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Game Username *</Label>
                    <Input
                      id="username"
                      value={formData.game_username}
                      onChange={(e) => setFormData({...formData, game_username: e.target.value})}
                      placeholder="Your game username"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Game Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.game_password}
                      onChange={(e) => setFormData({...formData, game_password: e.target.value})}
                      placeholder="Your game password"
                      required
                    />
                  </div>
                </div>

                {/* Verification Section for Email-Required Games */}
                {isEmailRequired(formData.game) && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-primary">
                      <AlertTriangle className="h-5 w-5" />
                      <h3 className="font-semibold">Account Verification Required</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Valorant accounts require additional verification. Choose your preferred method:
                    </p>
                    
                    <div>
                      <Label htmlFor="verification">Verification Method *</Label>
                      <Select 
                        value={formData.verification_method} 
                        onValueChange={(value) => setFormData({...formData, verification_method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Google Email & Password</SelectItem>
                          <SelectItem value="discord">Discord Username</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.verification_method === 'email' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-sm font-medium text-amber-800">
                            <strong>TURN OFF 2-STEP VERIFICATION OF YOUR GOOGLE ACCOUNT</strong>
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Write email and password of your Gmail which is connected to your game account
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="google_email">Google Email *</Label>
                            <Input
                              id="google_email"
                              type="email"
                              value={formData.google_email}
                              onChange={(e) => setFormData({...formData, google_email: e.target.value})}
                              placeholder="your.email@gmail.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="google_password">Google Password *</Label>
                            <Input
                              id="google_password"
                              type="password"
                              value={formData.google_password}
                              onChange={(e) => setFormData({...formData, google_password: e.target.value})}
                              placeholder="Your Google password"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.verification_method === 'discord' && (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            If you prefer not to share your Google credentials for security reasons, 
                            you can use Discord verification instead.
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="discord_username">Discord Username *</Label>
                          <Input
                            id="discord_username"
                            value={formData.discord_username}
                            onChange={(e) => setFormData({...formData, discord_username: e.target.value})}
                            placeholder="username#1234"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            After submission, a checker will send you a friend request for verification
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};