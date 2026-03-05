import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import MenuItemCard from './MenuItemCard';


// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  selectedCategory: string; // currently chosen by parent/subnav
  onCategoryClick: (categoryId: string) => void; // parent handler
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity, selectedCategory, onCategoryClick }) => {
  const { categories } = useCategories();
  const [activeCategory, setActiveCategory] = React.useState(selectedCategory || 'all');

  // Preload images when menu items change
  React.useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const itemsToPreload = activeCategory === 'all'
        ? menuItems.slice(0, 10)
        : menuItems.filter(item => item.category === activeCategory);

      preloadImages(itemsToPreload);

      // Then preload other images after a short delay
      const timer = setTimeout(() => {
        const otherItems = activeCategory === 'all'
          ? menuItems.slice(10)
          : menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [menuItems, activeCategory]);


  // when available categories load, ensure activeCategory exists or is 'all'
  React.useEffect(() => {
    if (categories.length > 0 && activeCategory !== 'all') {
      if (!categories.find(cat => cat.id === activeCategory)) {
        const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  // sync with prop and scroll into view when parent selection changes
  React.useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);

      if (selectedCategory !== 'all') {
        const element = document.getElementById(selectedCategory);
        if (element) {
          const headerHeight = 64;
          const mobileNavHeight = 60;
          const offset = headerHeight + mobileNavHeight + 20;
          const elementPosition = element.offsetTop - offset;
          window.scrollTo({ top: elementPosition, behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [selectedCategory, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);


  return (
    <main className="bg-theme min-h-screen w-full">
      <div className="w-full px-6 sm:px-12 lg:px-16 xl:px-24 py-16">
        {/* Show message if no items at all */}
        {menuItems.length === 0 && (
          <div className="text-center py-20 text-theme">
            <h2 className="text-3xl font-blueprint-display accent-theme mb-4">No Menu Items Yet</h2>
            <p className="text-theme mb-8" style={{ color: 'var(--secondary-text)' }}>The menu is being prepared. Please check back soon or contact the administrator.</p>
          </div>
        )}

        {categories.map((category) => {
          const categoryItems = menuItems.filter(item => item.category === category.id);

          // Show empty categories with a message instead of hiding them
          if (categoryItems.length === 0 && menuItems.length > 0) {
            return (
              <section key={category.id} id={category.id} className="menu-section mb-32 px-4 lg:px-8">
                <div className="flex items-center justify-center mb-20">
                  <div className="text-center">
                    <h3 className="text-4xl font-blueprint-display accent-theme mb-4">{category.name}</h3>
                    <div className="w-24 h-1 mt-2 bg-[#8B4513] mx-auto rounded-full"></div>
                  </div>
                </div>
                <div className="text-center py-12 bg-card-theme rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--secondary-text)' }}>
                  <p className="text-theme text-lg" style={{ color: 'var(--secondary-text)' }}>No items in this category yet</p>
                </div>
              </section>
            );
          }

          if (categoryItems.length === 0) return null;

          return (
            <section key={category.id} id={category.id} className="menu-section mb-32 px-4 lg:px-8">
              <div className="flex items-center justify-center mb-20">
                <div className="text-center">
                  <h3 className="text-4xl font-blueprint-display accent-theme mb-4">{category.name}</h3>
                  <div className="w-24 h-1 mt-2 bg-[#8B4513] mx-auto rounded-full"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12 w-full">
                {/* center items and add larger gap for breathing room */}
                {categoryItems.map((item) => {
                  const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={addToCart}
                      quantity={cartItem?.quantity || 0}
                      onUpdateQuantity={updateQuantity}
                      allItems={menuItems}
                      cartItems={cartItems}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};

export default Menu;
