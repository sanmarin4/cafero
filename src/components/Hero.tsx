import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-ramen-cream to-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-noto-kr font-semibold text-ramen-dark mb-6 animate-fade-in">
          Bold Korean Flavors, Slurpy Ramen Bowls
          <span className="block text-ramen-red mt-2">Ramen Yard</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
          Handcrafted broths, springy noodles, Korean street-food favorites.
        </p>
        <div className="flex justify-center">
          <a 
            href="#ramen"
            className="bg-ramen-red text-white px-8 py-3 rounded-full hover:bg-ramen-kimchi transition-all duration-300 transform hover:scale-105 font-medium"
          >
            Explore Menu
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;