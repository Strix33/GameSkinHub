import { Gamepad2, User, ShoppingCart, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Cart } from './Cart';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

export const Header = () => {
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text">GameHub</h1>
              <p className="text-xs text-muted-foreground">Premium Gaming Accounts</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="text-foreground hover:text-primary transition-colors">Browse</button>
            {user && (
              <button 
                onClick={() => navigate('/sell')} 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Sell
              </button>
            )}
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Dialog open={cartOpen} onOpenChange={setCartOpen}>
              <DialogTrigger asChild>
                <button className="relative p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {totalItems}
                    </span>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <Cart />
              </DialogContent>
            </Dialog>
            
            {user && isAdmin && (
              <button 
                className="flex items-center gap-2 gaming-btn bg-red-600 hover:bg-red-700" 
                onClick={() => navigate('/admin')}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            )}
            
            <button className="flex items-center gap-2 gaming-btn" onClick={handleAuthClick}>
              {user ? <LogOut className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {user ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};