import { useState } from 'react';
import { Header } from '@/components/Header';
import { GameNavigation } from '@/components/GameNavigation';
import { GameAccountsGrid } from '@/components/GameAccountsGrid';

const Index = () => {
  const [activeGame, setActiveGame] = useState('valorant');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const [priceFilter, setPriceFilter] = useState('');
  const [skinCountFilter, setSkinCountFilter] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <GameNavigation
        activeGame={activeGame}
        onGameChange={setActiveGame}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceFilter={priceFilter}
        onPriceFilterChange={setPriceFilter}
        skinCountFilter={skinCountFilter}
        onSkinCountFilterChange={setSkinCountFilter}
      />

      <GameAccountsGrid
        activeGame={activeGame}
        searchTerm={searchTerm}
        sortBy={sortBy}
        priceFilter={priceFilter}
        skinCountFilter={skinCountFilter}
      />
    </div>
  );
};

export default Index;
