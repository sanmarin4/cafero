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
  selectedCategory: string; // currently chosen by parent/subnav
}


const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, selectedCategory }) => {
  const { categories } = useCategories();

  // helper to perform slacky comparisons between stored category value and id
  const matchesCategory = (itemCat: string, catId: string) => {
    if (!itemCat) return false;
    const a = itemCat.toLowerCase().trim();
    const b = catId.toLowerCase().trim();
    if (a === b) return true;
    if (a.replace(/[- ]/g, '') === b.replace(/[- ]/g, '')) return true;
    const catObj = categories.find(c => c.id === itemCat || c.name.toLowerCase() === a);
    return catObj?.id === catId;
  };

  // determine items visible according to selected category
  const visibleItems = React.useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return menuItems;
    return menuItems.filter(item => matchesCategory(item.category, selectedCategory));
  }, [menuItems, selectedCategory, categories]);

  // preload the first batch of visible images
  React.useEffect(() => {
    if (visibleItems.length > 0) {
      preloadImages(visibleItems.slice(0, 10));
    }
  }, [visibleItems]);

  // scroll page back to top when category changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);


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

        {/** when "all" is selected show a flat grid of all items */}
        {selectedCategory === 'all' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 justify-center w-full max-w-screen-xl mx-auto">
            {visibleItems.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                allItems={menuItems}
                cartItems={cartItems}
              />
            ))}
          </div>
        ) : (
          (() => {
            const cat = categories.find(c => c.id === selectedCategory);
            const title = cat ? cat.name : selectedCategory;
            const items = visibleItems;
            return (
              <section key={selectedCategory} className="menu-section mb-32 px-4 lg:px-8">
                <div className="flex items-center justify-center mb-20">
                  <div className="text-center">
                    <h3 className="text-4xl font-blueprint-display accent-theme mb-4">{title}</h3>
                    <div className="w-24 h-1 mt-2 bg-[#8B4513] mx-auto rounded-full"></div>
                  </div>
                </div>
                {items.length === 0 ? (
                  <div className="text-center py-12 bg-card-theme rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--secondary-text)' }}>
                    <p className="text-theme text-lg" style={{ color: 'var(--secondary-text)' }}>No items in this category yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 justify-center w-full max-w-screen-xl mx-auto">
                    {items.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={addToCart}
                        allItems={menuItems}
                        cartItems={cartItems}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })()
        )}
      </div>
    </main>
  );
};

export default Menu;
