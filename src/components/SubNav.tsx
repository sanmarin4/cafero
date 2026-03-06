import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-20 z-40 bg-blueprint-blue-100/90 backdrop-blur-sm border-b border-blueprint-blue-50">
      <div className="w-full px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 py-6 scrollbar-hide w-full bg-blueprint-blue-50/50" style={{ padding:'0 16px' }}>
          {loading ? (
            <div className="flex space-x-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 w-24 bg-[#C8B69B]/20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`flex-shrink-0 whitespace-nowrap min-w-max px-4 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-200 ${selectedCategory === 'all'
                  ? 'bg-blueprint-blue text-white shadow-md'
                  : 'bg-blueprint-blue-50 text-blueprint-blue hover:bg-blueprint-blue/60 border border-blueprint-blue-50 cursor-pointer'
                  }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`flex-shrink-0 whitespace-nowrap min-w-max px-4 py-2 md:px-8 md:py-3 rounded-full text-sm md:text-base font-semibold transition-all duration-200 flex items-center space-x-2 ${selectedCategory === c.id
                    ? 'bg-blueprint-blue text-white shadow-md'
                    : 'bg-blueprint-blue-50 text-blueprint-blue hover:bg-blueprint-blue/60 border border-blueprint-blue-50 cursor-pointer'
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


