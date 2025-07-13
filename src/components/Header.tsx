import { Gamepad2, User, ShoppingCart } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
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
            <a href="#" className="text-foreground hover:text-primary transition-colors">Browse</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sell</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                3
              </span>
            </button>
            
            <button className="flex items-center gap-2 gaming-btn">
              <User className="h-4 w-4" />
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};