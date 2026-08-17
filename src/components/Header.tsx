import { Gamepad2, User, ShoppingCart, LogOut, Shield, ClipboardCheck } from 'lucide-react';
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
  const { role, isAdmin, isChecker } = useUserRole();
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
    <header className="border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-tight text-foreground">GameHub</h1>
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
                <button aria-label="Open cart" className="relative rounded-lg border border-border bg-secondary/50 p-2 text-foreground transition-colors hover:bg-secondary">
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
            
            {user && (isChecker || isAdmin) && (
              <button 
                className="gaming-btn bg-secondary text-foreground hover:bg-secondary/80 border border-border" 
                onClick={() => navigate('/checker')}
              >
                <ClipboardCheck className="h-4 w-4" />
                Checker
              </button>
            )}
            
            {user && isAdmin && (
              <button 
                className="gaming-btn bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                onClick={() => navigate('/admin')}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            )}
            
            <button className="gaming-btn" onClick={handleAuthClick}>
              {user ? <LogOut className="h-4 w-4" /> : <User className="h-4 w-4" />}
              {user ? 'Sign Out' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};