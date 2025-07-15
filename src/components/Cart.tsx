import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalItems, totalPrice, loading } = useCart();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading cart...</div>
        </CardContent>
      </Card>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping Cart ({totalItems} items)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <img
              src={item.account.image_url || '/placeholder.svg'}
              alt={item.account.title}
              className="w-16 h-16 object-cover rounded"
            />
            
            <div className="flex-1">
              <h4 className="font-semibold">{item.account.title}</h4>
              <Badge variant="secondary" className="capitalize">
                {item.account.game}
              </Badge>
              <p className="text-lg font-bold text-primary mt-1">
                ${item.account.price.toFixed(2)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-8 text-center font-semibold">
                {item.quantity}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeFromCart(item.id)}
                className="h-8 w-8 ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between items-center pt-4">
          <span className="text-xl font-bold">Total:</span>
          <span className="text-2xl font-bold text-primary">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
};