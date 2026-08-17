import { ShoppingCart, Star, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { AccountData } from '@/types/database';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import images
import valorantSkins from '@/assets/valorant-skins.jpg';
import csgoWeapons from '@/assets/csgo-weapons.jpg';
import minecraftCharacter from '@/assets/minecraft-character.jpg';
import gamingHero from '@/assets/gaming-hero.jpg';

interface AccountCardProps {
  account: AccountData;
}

const rarityColors = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-yellow-400',
};

const rarityGlow = {
  common: 'shadow-gray-500/20',
  rare: 'shadow-blue-500/20',
  epic: 'shadow-purple-500/20',
  legendary: 'shadow-yellow-500/20',
  Rare: 'shadow-blue-500/20',
  Epic: 'shadow-purple-500/20',
  Legendary: 'shadow-yellow-500/20',
};

export const AccountCard = ({ account }: AccountCardProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking add to cart
    if (!user) {
      navigate('/auth');
      return;
    }
    
    addToCart(account.id);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const getGameImage = (game: string) => {
    switch (game.toLowerCase()) {
      case 'valorant':
        return valorantSkins;
      case 'csgo':
        return csgoWeapons;
      case 'minecraft':
        return minecraftCharacter;
      default:
        return gamingHero;
    }
  };

  const highestRarity = account.skins.reduce((highest, skin) => {
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4, Rare: 2, Epic: 3, Legendary: 4 };
    const skinRarity = skin.rarity?.toLowerCase() || 'common';
    const currentOrder = rarityOrder[skinRarity as keyof typeof rarityOrder] || 1;
    const highestOrder = rarityOrder[highest.toLowerCase() as keyof typeof rarityOrder] || 1;
    return currentOrder > highestOrder ? skinRarity : highest;
  }, 'common');

  return (
    <>
      <div 
        className={`gaming-card group h-full cursor-pointer ${account.featured ? 'border-primary/40' : ''}`}
        onClick={handleCardClick}
      >
      {account.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 rounded-full border border-primary/30 bg-background/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary backdrop-blur-sm">
            <Star className="h-3 w-3" />
            Featured
          </div>
        </div>
      )}

      {/* Account Image */}
      <div className="relative h-44 overflow-hidden border-b border-border">
        <div 
          className="absolute inset-0 bg-secondary"
          style={{
            backgroundImage: `url(${account.image_url || getGameImage(account.game)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary">
            {account.title}
          </h3>
          {account.bundle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{account.bundle}</p>
          )}
        </div>

        {/* Skins List */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Skins · {account.skins.length}</span>
            <div className={`w-2 h-2 rounded-full ${rarityColors[highestRarity as keyof typeof rarityColors]} ${rarityGlow[highestRarity as keyof typeof rarityGlow]} shadow-lg`} />
          </div>
          
          <div className="space-y-1.5">
            {account.skins.slice(0, 3).map((skin, index) => (
              <div key={skin.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground/80 truncate">{skin.name}</span>
                <span className={`${rarityColors[skin.rarity?.toLowerCase() as keyof typeof rarityColors] || rarityColors.common} font-medium capitalize text-xs`}>
                  {skin.rarity || 'Common'}
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
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-semibold text-foreground">${account.price}</span>
            <span className="text-xs text-muted-foreground">USD</span>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="gaming-btn"
          >
            <ShoppingCart className="h-4 w-4" />
            {user ? 'Add to Cart' : 'Sign In'}
          </button>
        </div>
      </div>

        </div>

      {/* Skins Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {account.title} - All Skins ({account.skins.length})
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {account.skins.map((skin) => (
              <div key={skin.id} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-foreground">{skin.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rarity:</span>
                  <span className={`${rarityColors[skin.rarity?.toLowerCase() as keyof typeof rarityColors] || rarityColors.common} font-medium capitalize text-sm`}>
                    {skin.rarity || 'Common'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 mt-4 border-t">
            <div>
              <span className="font-display text-2xl font-semibold text-foreground">${account.price}</span>
              <span className="text-sm text-muted-foreground ml-1">USD</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(e);
                setIsModalOpen(false);
              }}
              className="gaming-btn"
            >
              <ShoppingCart className="h-4 w-4" />
              {user ? 'Add to Cart' : 'Sign In'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};