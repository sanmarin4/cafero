import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import { useMenu } from './hooks/useMenu';

// TypeScript declarations for development test functions
declare global {
  interface Window {
    testSupabaseConnection?: () => Promise<void>;
    testMenuOperations?: () => Promise<void>;
  }
}

// Import test functions for development
if (import.meta.env.DEV) {
  import('./lib/supabase-test')
    .then((module) => {
      window.testSupabaseConnection = module.testSupabaseConnection;
      window.testMenuOperations = module.testMenuOperations;
      console.log('🧪 Development Mode: Supabase test functions loaded');
      console.log('   Available functions:');
      console.log('   • testSupabaseConnection() - Test database & storage');
      console.log('   • testMenuOperations() - Test CRUD operations');
    })
    .catch((error) => {
      console.warn('Failed to load Supabase test functions:', error);
    });
}

function MainApp() {
  const cart = useCart();
  const { menuItems, useFallback } = useMenu();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-blueprint-off-white font-sans">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
      />
      
      {/* Show notification when using sample data */}
      {useFallback && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-center">
          <p className="font-medium">📝 Currently showing sample menu data</p>
          <p className="text-sm">Visit <span className="font-semibold text-yellow-800">/admin</span> to add your own menu items and categories</p>
        </div>
      )}
      
      <SubNav selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
      
      {currentView === 'menu' && (
        <Menu 
          menuItems={filteredMenuItems}
          addToCart={cart.addToCart}
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
        />
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
        />
      )}
      
      {currentView === 'menu' && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;