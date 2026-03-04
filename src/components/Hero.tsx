import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blueprint-off-white via-blueprint-cream to-blueprint-off-white py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-7xl md:text-8xl font-blueprint-display text-blueprint-blue mb-8 animate-fade-in tracking-wide">
            MENU
          </h1>
          <div className="inline-flex items-center justify-center mb-12">
            <div className="bg-blueprint-blue rounded-full px-12 py-4 shadow-lg">
              <h2 className="text-3xl font-blueprint-bold text-blueprint-cream tracking-wider">CAFERO</h2>
              <p className="text-sm font-blueprint text-blueprint-cream opacity-90 -mt-1 tracking-widest">SNACKS & COFFEE</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="text-xl font-blueprint text-blueprint-gray-soft mb-10 animate-slide-up leading-relaxed">
              Experience the finest coffee and snacks crafted with passion and premium ingredients.
              From artisanal brews to delicious treats, discover the CAFERO difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <a 
                href="#coffee-classics"
                className="bg-blueprint-blue text-blueprint-cream px-10 py-4 rounded-lg hover:bg-blueprint-blue-dark transition-all duration-300 transform hover:scale-105 font-blueprint-bold text-lg shadow-lg"
              >
                Coffee & Beverages
              </a>
              <a 
                href="#specialty-drinks"
                className="border-2 border-blueprint-blue text-blueprint-blue px-10 py-4 rounded-lg hover:bg-blueprint-blue hover:text-blueprint-cream transition-all duration-300 transform hover:scale-105 font-blueprint-bold text-lg"
              >
                Snacks & Treats
              </a>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Coffee cups illustration inspired by the menu design */}
              <div className="relative w-64 h-64">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white border-4 border-blueprint-blue rounded-lg"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white border-4 border-blueprint-blue rounded-lg"></div>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white border-4 border-blueprint-blue rounded-lg"></div>
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white border-4 border-blueprint-blue rounded-lg">
                  <div className="w-full h-full bg-blueprint-blue/20 rounded-t-lg"></div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blueprint-blue rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;