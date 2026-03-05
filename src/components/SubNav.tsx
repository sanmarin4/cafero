import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-20 z-40 bg-blueprint-off-white/95 backdrop-blur-md border-b border-blueprint-blue/20">
      <div className="w-full px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex items-center justify-start gap-4 overflow-x-auto py-6 scrollbar-hide w-full">
          {loading ? (
            <div className="flex space-x-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-24 bg-[#5C4033]/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`flex-shrink-0 px-8 py-3 rounded-2xl text-base font-bold transition-all duration-200 shadow-sm ${selectedCategory === 'all'
                  ? 'bg-[#8B4513] text-white shadow-md border-transparent border'
                  : 'bg-white text-[#8B4513] hover:bg-[#8B4513]/5 border border-[#EBEBEB]'
                  }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`flex-shrink-0 px-8 py-3 rounded-2xl text-base font-bold transition-all duration-200 flex items-center space-x-2 shadow-sm ${selectedCategory === c.id
                    ? 'bg-[#8B4513] text-white shadow-md border-transparent border'
                    : 'bg-white text-[#8B4513] hover:bg-[#8B4513]/5 border border-[#EBEBEB]'
                    }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;


