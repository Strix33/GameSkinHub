import { useState } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

const games = [
  { id: 'valorant', name: 'Valorant', color: 'text-red-400' },
  { id: 'minecraft', name: 'Minecraft', color: 'text-green-400' },
  { id: 'csgo', name: 'CS:GO', color: 'text-yellow-400' },
];

interface GameNavigationProps {
  activeGame: string;
  onGameChange: (game: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceFilter: string;
  onPriceFilterChange: (filter: string) => void;
  skinCountFilter: string;
  onSkinCountFilterChange: (filter: string) => void;
}

export const GameNavigation = ({
  activeGame,
  onGameChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  priceFilter,
  onPriceFilterChange,
  skinCountFilter,
  onSkinCountFilterChange,
}: GameNavigationProps) => {
  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        {/* Game Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-secondary/30 rounded-lg p-1 gaming-card">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => onGameChange(game.id)}
                className={`
                  px-6 py-3 rounded-md font-semibold transition-all duration-300 relative
                  ${activeGame === game.id 
                    ? 'bg-primary text-primary-foreground shadow-lg neon-text' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }
                `}
              >
                <span className={activeGame === game.id ? game.color : ''}>
                  {game.name}
                </span>
                {activeGame === game.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse rounded-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={`Search ${games.find(g => g.id === activeGame)?.name} skins...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 gaming-input"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="gaming-input"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="skins-asc">Skins: Low to High</option>
              <option value="skins-desc">Skins: High to Low</option>
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={priceFilter}
              onChange={(e) => onPriceFilterChange(e.target.value)}
              className="gaming-input"
            >
              <option value="">All Prices</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200+">$200+</option>
            </select>
          </div>

          {/* Skin Count Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Skins:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => onSkinCountFilterChange(skinCountFilter === count.toString() ? '' : count.toString())}
                  className={`
                    w-8 h-8 rounded text-sm font-semibold transition-all duration-200
                    ${skinCountFilter === count.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                  `}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};