import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Game {
  id: string;
  name: string;
  color: string;
}

const defaultColors = ['text-red-400', 'text-green-400', 'text-yellow-400', 'text-blue-400', 'text-purple-400', 'text-pink-400', 'text-orange-400'];

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
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(7);

      if (error) throw error;

      const gamesWithColors = data.map((game, index) => ({
        id: game.name,
        name: game.name.charAt(0).toUpperCase() + game.name.slice(1),
        color: defaultColors[index % defaultColors.length]
      }));

      setGames(gamesWithColors);
    } catch (error) {
      console.error('Error fetching games:', error);
      // Fallback to default games
      setGames([
        { id: 'valorant', name: 'Valorant', color: 'text-red-400' },
        { id: 'minecraft', name: 'Minecraft', color: 'text-green-400' },
        { id: 'csgo', name: 'CS:GO', color: 'text-yellow-400' },
      ]);
    }
  };
  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        {/* Game Tabs */}
        <div className="mb-4 flex">
          <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-secondary/40 p-1">

            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => onGameChange(game.id)}
                className={`
                  relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200
                  ${activeGame === game.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                <span>{game.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={`Search ${games.find(g => g.id === activeGame)?.name} skins...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full gaming-input pl-10"
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
                    h-8 w-8 rounded-md border text-sm font-medium transition-colors duration-200
                    ${skinCountFilter === count.toString()
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
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