import React, { useContext } from "react";
import { ShoppingCart, Sun, Moon } from "lucide-react";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { ThemeContext } from "../contexts/ThemeContext";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  cartItemsCount,
  onCartClick,
  onMenuClick,
}) => {
  const { siteSettings, loading } = useSiteSettings();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="sticky top-0 z-50 bg-theme border-b border-blueprint-blue/20 backdrop-blur-md">
      <div className="w-full px-6 sm:px-12 lg:px-16 xl:px-24">

        <div className="flex items-center justify-between h-20">

          {/* Logo + Name */}
          <button
            onClick={onMenuClick}
            className="flex items-center gap-4"
          >
            {loading ? (
              <div className="w-12 h-12 bg-blueprint-blue/10 rounded-full animate-pulse" />
            ) : (
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#8B4513]/20">
                <img
                  src="/CAFERO.jpg"
                  alt="CAFERO Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-3xl font-bold tracking-tight text-[#8B4513]">
              {siteSettings?.site_name?.toUpperCase() || "CAFERO"}
            </h1>
          </button>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* Store Hours */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-blueprint text-theme opacity-70">
                OPEN DAILY
              </p>
              <p className="text-sm font-blueprint-bold text-theme">
                8:00AM - 11:00PM
              </p>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blueprint-blue/10"
            >
              {theme === "pink" ? (
                <Sun className="h-5 w-5 accent-theme" />
              ) : (
                <Moon className="h-5 w-5 text-[#8B4513]" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-3 rounded-full hover:bg-blueprint-blue/10"
            >
              <ShoppingCart className="h-6 w-6 text-[#8B4513]" />

              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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