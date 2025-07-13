import { useState } from 'react';
import { AccountCard, AccountData } from './AccountCard';
import { mockAccounts } from '@/data/mockAccounts';

interface GameAccountsGridProps {
  activeGame: string;
  searchTerm: string;
  sortBy: string;
  priceFilter: string;
  skinCountFilter: string;
}

export const GameAccountsGrid = ({
  activeGame,
  searchTerm,
  sortBy,
  priceFilter,
  skinCountFilter,
}: GameAccountsGridProps) => {
  const [purchasingAccount, setPurchasingAccount] = useState<string | null>(null);

  const handlePurchase = async (account: AccountData) => {
    setPurchasingAccount(account.id);
    // Simulate purchase process
    setTimeout(() => {
      alert(`Purchase initiated for ${account.title}! 🎮`);
      setPurchasingAccount(null);
    }, 1000);
  };

  // Filter accounts by game
  let filteredAccounts = mockAccounts.filter(account => account.game === activeGame);

  // Apply search filter
  if (searchTerm) {
    filteredAccounts = filteredAccounts.filter(account =>
      account.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.skins.some(skin => skin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      account.bundle?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply price filter
  if (priceFilter) {
    filteredAccounts = filteredAccounts.filter(account => {
      const price = account.price;
      switch (priceFilter) {
        case '0-50':
          return price >= 0 && price <= 50;
        case '50-100':
          return price > 50 && price <= 100;
        case '100-200':
          return price > 100 && price <= 200;
        case '200+':
          return price > 200;
        default:
          return true;
      }
    });
  }

  // Apply skin count filter
  if (skinCountFilter) {
    const targetCount = parseInt(skinCountFilter);
    filteredAccounts = filteredAccounts.filter(account => account.skins.length >= targetCount);
  }

  // Apply sorting
  filteredAccounts.sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'skins-asc':
        return a.skins.length - b.skins.length;
      case 'skins-desc':
        return b.skins.length - a.skins.length;
      default:
        return 0;
    }
  });

  // Sort featured accounts to the top
  filteredAccounts.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  if (filteredAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No accounts found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold neon-text mb-2">
          {activeGame.charAt(0).toUpperCase() + activeGame.slice(1)} Accounts
        </h2>
        <p className="text-muted-foreground">
          Found {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAccounts.map((account) => (
          <div
            key={account.id}
            className={`transition-opacity duration-300 ${
              purchasingAccount === account.id ? 'opacity-50' : 'opacity-100'
            }`}
          >
            <AccountCard
              account={account}
              onPurchase={handlePurchase}
            />
          </div>
        ))}
      </div>
    </div>
  );
};