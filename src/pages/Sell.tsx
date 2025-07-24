import { useState } from 'react';
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
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Header } from '@/components/Header';

export const Sell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    game: '',
    price: '',
    amount_of_skins: '',
    game_username: '',
    game_password: ''
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
      const { error } = await supabase
        .from('sell_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          game: formData.game,
          price: parseFloat(formData.price),
          amount_of_skins: parseInt(formData.amount_of_skins),
          skin_names: filteredSkinNames,
          game_username: formData.game_username,
          game_password: formData.game_password,
          status: 'pending'
        });

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
        game_password: ''
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