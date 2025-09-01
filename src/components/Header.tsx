import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-red-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-2 text-black hover:text-red-600 transition-colors duration-200"
          >
            <img src="/logo.jpg" className="w-10 h-10"/>
            <h1 className="text-2xl font-noto font-semibold">Nom Sum</h1>
          </button>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#dim-sum" className="text-gray-700 hover:text-red-600 transition-colors duration-200">Dim Sum</a>
            <a href="#noodles" className="text-gray-700 hover:text-red-600 transition-colors duration-200">Noodles</a>
            <a href="#rice-dishes" className="text-gray-700 hover:text-red-600 transition-colors duration-200">Rice Dishes</a>
            <a href="#beverages" className="text-gray-700 hover:text-red-600 transition-colors duration-200">Beverages</a>
          </nav>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-gray-700 hover:text-black hover:bg-yellow-100 rounded-full transition-all duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-gentle">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;