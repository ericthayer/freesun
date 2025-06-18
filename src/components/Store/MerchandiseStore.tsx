import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'apparel' | 'accessories' | 'gifts' | 'equipment';
  inStock: boolean;
  rating: number;
  reviews: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const MerchandiseStore: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const products: Product[] = [
    {
      id: '1',
      name: 'Free Sun Logo T-Shirt',
      description: 'Premium organic cotton t-shirt featuring our signature hot air balloon logo with Colorado mountain silhouette',
      price: 29.99,
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'apparel',
      inStock: true,
      rating: 4.8,
      reviews: 24
    },
    {
      id: '2',
      name: 'Colorado Mountains Hoodie',
      description: 'Cozy fleece-lined hoodie with embroidered Rocky Mountain skyline and Free Sun balloon club logo',
      price: 54.99,
      image: 'https://images.pexels.com/photos/8532773/pexels-photo-8532773.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'apparel',
      inStock: true,
      rating: 4.9,
      reviews: 18
    },
    {
      id: '3',
      name: 'Balloon Adventure Coffee Mug',
      description: 'Hand-crafted ceramic mug featuring colorful hot air balloons floating over Colorado landscapes',
      price: 16.99,
      image: 'https://images.pexels.com/photos/6068952/pexels-photo-6068952.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'gifts',
      inStock: true,
      rating: 4.7,
      reviews: 31
    },
    {
      id: '4',
      name: 'Aviator Pilot Cap',
      description: 'Classic aviator-style baseball cap with embroidered pilot wings and Free Sun logo, adjustable fit',
      price: 24.99,
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'accessories',
      inStock: true,
      rating: 4.6,
      reviews: 15
    },
    {
      id: '5',
      name: 'Colorado Landscape Print',
      description: 'Limited edition framed print of hot air balloons over the Front Range, photographed by our crew',
      price: 45.99,
      image: 'https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'gifts',
      inStock: true,
      rating: 4.9,
      reviews: 22
    },
    {
      id: '6',
      name: 'Professional Flight Log Book',
      description: 'Leather-bound pilot logbook for recording balloon flights, weather conditions, and crew notes',
      price: 39.99,
      image: 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'equipment',
      inStock: true,
      rating: 4.9,
      reviews: 12
    },
    {
      id: '7',
      name: 'Mountain Adventure Backpack',
      description: 'Durable hiking backpack with balloon club patches, perfect for chase crew and outdoor adventures',
      price: 89.99,
      image: 'https://images.pexels.com/photos/1670045/pexels-photo-1670045.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'equipment',
      inStock: true,
      rating: 4.8,
      reviews: 19
    },
    {
      id: '8',
      name: 'Balloon Festival Poster',
      description: 'Vintage-style poster commemorating Colorado\'s annual hot air balloon festivals, museum-quality print',
      price: 22.99,
      image: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'gifts',
      inStock: true,
      rating: 4.7,
      reviews: 28
    },
    {
      id: '9',
      name: 'Insulated Travel Tumbler',
      description: 'Stainless steel tumbler with double-wall insulation, featuring sunrise balloon flight artwork',
      price: 19.99,
      image: 'https://images.pexels.com/photos/6068952/pexels-photo-6068952.jpeg?auto=compress&cs=tinysrgb&w=600&h=600',
      category: 'accessories',
      inStock: false,
      rating: 4.5,
      reviews: 33
    }
  ];

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'apparel', label: 'Apparel' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'gifts', label: 'Gifts & Art' },
    { value: 'equipment', label: 'Equipment' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Free Sun Store
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Premium merchandise celebrating Colorado's ballooning heritage and mountain adventures
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={
              <Badge badgeContent={getTotalItems()} color="primary">
                <MaterialIcon icon="shopping_cart" />
              </Badge>
            }
            onClick={() => setCartOpen(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Cart ${getTotalPrice().toFixed(2)}
          </Button>
        </Box>
      </Paper>

      {/* Category Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          {filteredProducts.length} products available
        </Typography>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="280"
                  image={product.image}
                  alt={product.description}
                  sx={{
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
                
                {/* Favorite Button */}
                <IconButton
                  onClick={() => toggleFavorite(product.id)}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {favorites.includes(product.id) ? 
                    <MaterialIcon icon="favorite" color="error" /> : 
                    <MaterialIcon icon="favorite_border" />
                  }
                </IconButton>

                {/* Stock Status */}
                {!product.inStock && (
                  <Chip
                    label="OUT OF STOCK"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 700,
                      backgroundColor: 'rgba(244, 67, 54, 0.95)',
                      color: 'white',
                    }}
                  />
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {product.name}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                  {product.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MaterialIcon icon="star" sx={{ color: 'warning.main', fontSize: 18 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {product.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({product.reviews} reviews)
                    </Typography>
                  </Box>
                  <Chip
                    label={product.category.replace('_', ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 'auto', textTransform: 'capitalize' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ${product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: product.inStock ? '0 4px 12px rgba(66, 133, 244, 0.3)' : 'none',
                      '&:hover': {
                        boxShadow: product.inStock ? '0 6px 20px rgba(66, 133, 244, 0.4)' : 'none',
                        transform: product.inStock ? 'translateY(-1px)' : 'none',
                      },
                    }}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Shopping Cart Dialog */}
      <Dialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Shopping Cart</Typography>
          <IconButton onClick={() => setCartOpen(false)}>
            <MaterialIcon icon="close" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {cart.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <MaterialIcon icon="shopping_cart" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse our collection and add items to get started
              </Typography>
            </Box>
          ) : (
            <List>
              {cart.map((item, index) => (
                <React.Fragment key={item.product.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.product.name}
                        </Typography>
                      }
                      secondary={`$${item.product.price.toFixed(2)} each`}
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { borderColor: 'primary.main' }
                          }}
                        >
                          <MaterialIcon icon="remove" fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { borderColor: 'primary.main' }
                          }}
                        >
                          <MaterialIcon icon="add" fontSize="small" />
                        </IconButton>
                        <Typography sx={{ ml: 2, minWidth: 70, textAlign: 'right', fontWeight: 600 }}>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < cart.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              <Divider sx={{ my: 2 }} />
              <ListItem sx={{ px: 0, py: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                <ListItemText
                  primary={
                    <Typography variant="h6" fontWeight="bold">
                      Total: ${getTotalPrice().toFixed(2)}
                    </Typography>
                  }
                  secondary={`${getTotalItems()} items`}
                />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setCartOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            disabled={cart.length === 0}
            onClick={() => {
              alert('Checkout functionality would be implemented here');
              setCartOpen(false);
            }}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(66, 133, 244, 0.4)',
              }
            }}
          >
            Proceed to Checkout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MerchandiseStore;