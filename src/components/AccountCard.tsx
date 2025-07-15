import { ShoppingCart, Star, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface AccountData {
  id: string;
  game: string;
  title: string;
  price: number;
  skins: Array<{
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  bundle?: string;
  rank?: string;
  level?: number;
  image: string;
  featured?: boolean;
}

interface AccountCardProps {
  account: AccountData;
}

const rarityColors = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

const rarityGlow = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-blue-500/20',
  epic: 'shadow-purple-500/20',
  legendary: 'shadow-yellow-500/20',
};

export const AccountCard = ({ account }: AccountCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePurchase = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Simulate purchase
    toast({
      title: "Purchase Successful!",
      description: `You have successfully purchased the ${account.title} account.`,
    });
  };
  const highestRarity = account.skins.reduce((highest, skin) => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
    return rarityOrder[skin.rarity] > rarityOrder[highest] ? skin.rarity : highest;
  }, 'common' as const);

  return (
    <div className={`gaming-card group ${account.featured ? 'ring-2 ring-primary/50' : ''}`}>
      {account.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="h-3 w-3" />
            FEATURED
          </div>
        </div>
      )}

      {/* Account Image */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"
          style={{
            backgroundImage: `url(${account.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Rank Badge */}
        {account.rank && (
          <div className="absolute top-3 left-3">
            <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {account.rank}
            </div>
          </div>
        )}

        {/* Level Badge */}
        {account.level && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-accent/90 text-accent-foreground px-2 py-1 rounded text-xs font-bold">
              LVL {account.level}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {account.title}
          </h3>
          {account.bundle && (
            <p className="text-sm text-accent font-medium">{account.bundle}</p>
          )}
        </div>

        {/* Skins List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Skins ({account.skins.length})</span>
            <div className={`w-2 h-2 rounded-full ${rarityColors[highestRarity]} ${rarityGlow[highestRarity]} shadow-lg`} />
          </div>
          
          <div className="space-y-1 max-h-20 overflow-y-auto custom-scrollbar">
            {account.skins.slice(0, 3).map((skin, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80 truncate">{skin.name}</span>
                <span className={`${rarityColors[skin.rarity]} font-medium capitalize text-xs`}>
                  {skin.rarity}
                </span>
              </div>
            ))}
            {account.skins.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{account.skins.length - 3} more skins
              </div>
            )}
          </div>
        </div>

        {/* Price and Purchase */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <span className="text-2xl font-bold text-primary">${account.price}</span>
            <span className="text-sm text-muted-foreground ml-1">USD</span>
          </div>
          
          <button
            onClick={handlePurchase}
            className="gaming-btn flex items-center gap-2 text-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {user ? 'Purchase' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  );
};