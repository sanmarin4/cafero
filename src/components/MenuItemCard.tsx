import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { useCategories } from '../hooks/useCategories';

// simple reusable warning dialog component
const WarningDialog: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void }> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <p className="text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variations?: Variation | Variation[], addOns?: AddOn[]) => void;
  allItems?: MenuItem[];
  cartItems?: { id: string; quantity: number }[];
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  allItems = [],
  cartItems = [],
}) => {
  const { categories } = useCategories();
  const categoryName = categories.find(c => c.id === item.category)?.name || item.category;
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  // Group variations by type
  const variationGroups = React.useMemo(() => {
    const map = new Map<string, Variation[]>();
    (item.variations || []).forEach(v => {
      const key = v.type || 'Variation';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    return Array.from(map.entries()); // [ [type, Variation[]], ... ]
  }, [item.variations]);

  // Track one selected variation per type
  const [selectedVariationsByType, setSelectedVariationsByType] = useState<Record<string, Variation>>(() => {
    const initial: Record<string, Variation> = {};
    const map = new Map<string, Variation[]>();
    (item.variations || []).forEach(v => {
      const key = v.type || 'Variation';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    map.forEach((vars, type) => { if (vars[0]) initial[type] = vars[0]; });
    return initial;
  });

  // Flatten selected variations into an array
  const selectedVariationsArray = Object.values(selectedVariationsByType);

  const calculatePrice = () => {
    let price = item.effectivePrice || item.basePrice;
    selectedVariationsArray.forEach(v => { price += v.price; });
    selectedAddOns.forEach(addOn => { price += addOn.price * addOn.quantity; });
    return price;
  };

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const alertCallback = React.useRef<() => void>(() => { });

  const promptAlert = (message: string, onConfirm: () => void) => {
    setAlertMessage(message);
    alertCallback.current = onConfirm;
    setShowAlert(true);
  };

  const handleAddToCart = () => {
    promptAlert(`Add \"${item.name}\" to your cart?`, () => {
      if (item.variations?.length || item.addOns?.length) {
        setShowCustomization(true);
      } else {
        onAddToCart(item, 1);
      }
    });
  };

  const handleCustomizedAddToCart = () => {
    promptAlert(`Add \"${item.name}\" with customizations to your cart?`, () => {
      const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn =>
        Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
      );
      onAddToCart(item, 1, selectedVariationsArray, addOnsForCart);
      setShowCustomization(false);
      setSelectedAddOns([]);
    });
  };


  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);

      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }

      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      {showAlert && (
        <WarningDialog
          message={alertMessage}
          onConfirm={() => {
            setShowAlert(false);
            alertCallback.current();
          }}
          onCancel={() => setShowAlert(false)}
        />
      )}
      <div className="w-full max-w-[360px] mx-auto">
        <div
          className={`bg-blueprint-blue-100 rounded-xl shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md relative overflow-hidden ${!item.available ? 'opacity-50' : ''}`}
          style={{ padding: '16px' }}
        >
          {/* badges */}
          {item.popular && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              Popular
            </div>
          )}
          {!item.available && (
            <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              Unavailable
            </div>
          )}

          {/* image area */}
          <div className="w-full flex items-center justify-center bg-white overflow-hidden rounded-lg shadow-md p-4 border border-gray-200">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="object-contain max-h-36"
                loading="lazy"
                decoding="async"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-6xl opacity-30" style={{ color: '#8B4513' }}>☕</div>
            )}
          </div>

          {/* text & footer */}
          <div className="mt-4 flex flex-col h-full">
            <h4 className="font-semibold text-base text-[#1E1E1E] line-clamp-2 mb-3">
              {item.name}
            </h4>
            {item.description && (
              <p className="text-sm text-[#666] mb-2 line-clamp-2">
                {item.description}
              </p>
            )}
            {categoryName && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blueprint-blue-50 text-blueprint-blue mb-2">
                {categoryName}
              </span>
            )}

            <div className="mt-auto flex items-center justify-between">
              <span className="font-semibold text-lg text-[#1E1E1E]">
                {item.isOnDiscount && item.discountPrice ? (
                  <>
                    <span>from ₱{item.discountPrice.toFixed(0)}</span>
                    <span className="line-through text-xs opacity-75 ml-1">₱{item.basePrice.toFixed(0)}</span>
                  </>
                ) : (
                  <span>from ₱{item.basePrice.toFixed(0)}</span>
                )}
              </span>
              <button
                onClick={handleAddToCart}
                disabled={!item.available}
                className="bg-white text-blueprint-blue px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-blueprint-blue hover:bg-blueprint-blue-50 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Full-Screen Sheet */}
      {showCustomization && (() => {
        // Same-category first, then popular, then rest — always fills up to 6
        const suggestedItems = allItems
          .filter(i => i.id !== item.id && i.available !== false)
          .sort((a, b) => {
            const aMatch = a.category === item.category ? 0 : 1;
            const bMatch = b.category === item.category ? 0 : 1;
            if (aMatch !== bMatch) return aMatch - bMatch;
            return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
          })
          .slice(0, 6);

        return (
          <div className="fixed inset-0 z-50 flex flex-col">
            {/* Sheet — full screen, slides up */}
            <div
              className="relative w-full h-full flex flex-col"
              style={{
                background: '#FAFAF8',
                animation: 'ccSlideUp 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              {/* Hero image */}
              <div className="relative flex-shrink-0 overflow-hidden" style={{ height: '42dvh', minHeight: '220px', maxHeight: '340px' }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #8B4513, #A0522D)' }}
                  >
                    <span className="text-6xl opacity-20">☕</span>
                  </div>
                )}
                {/* Gradient fade into sheet */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 35%, rgba(250,250,248,0.72) 72%, #FAFAF8 100%)',
                  }}
                />
                {/* Close button */}
                <button
                  onClick={() => setShowCustomization(false)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                  style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(6px)' }}
                >
                  <X className="h-4 w-4 text-white" />
                </button>
                {/* Item title overlaid at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
                  <h2
                    className="text-2xl font-bold leading-tight"
                    style={{ color: '#1E1E1E', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}
                  >
                    {item.name}
                  </h2>
                  {item.description && (
                    <p className="text-sm mt-1 line-clamp-1" style={{ color: '#777' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: '#D8D8D0' }} />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 pt-3 pb-32">

                {/* Variations — one section per type */}
                {variationGroups.map(([type, vars]) => (
                  <div key={type} className="mb-7">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="font-semibold text-base"
                        style={{ color: '#1E1E1E', letterSpacing: '-0.01em' }}
                      >
                        {type}
                      </h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(139,69,19,0.08)', color: '#8B4513' }}
                      >
                        Pick 1
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {vars.map((variation) => {
                        const isSelected = selectedVariationsByType[type]?.id === variation.id;
                        return (
                          <button
                            key={variation.id}
                            type="button"
                            onClick={() =>
                              setSelectedVariationsByType(prev => ({ ...prev, [type]: variation }))
                            }
                            className="relative p-4 rounded-2xl text-left transition-all duration-200 active:scale-95"
                            style={{
                              background: isSelected ? '#8B4513' : '#fff',
                              border: `2px solid ${isSelected ? '#8B4513' : '#EAEAE6'}`,
                              boxShadow: isSelected
                                ? '0 4px 18px rgba(30,58,138,0.28)'
                                : '0 1px 4px rgba(0,0,0,0.05)',
                            }}
                          >
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 border-white/40 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                            )}
                            <div
                              className="font-semibold text-sm mb-0.5"
                              style={{ color: isSelected ? '#fff' : '#1E1E1E' }}
                            >
                              {variation.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: isSelected ? 'rgba(255,255,255,0.65)' : '#999' }}
                            >
                              {variation.price === 0 ? 'Included' : `+₱${variation.price.toFixed(0)}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Add-ons */}
                {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="font-semibold text-base"
                        style={{ color: '#1E1E1E', letterSpacing: '-0.01em' }}
                      >
                        Add-ons
                      </h3>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: '#F0F0EC', color: '#999' }}
                      >
                        Optional
                      </span>
                    </div>
                    <div className="space-y-5">
                      {Object.entries(groupedAddOns).map(([category, addOns]) => (
                        <div key={category}>
                          <p
                            className="text-xs font-bold uppercase tracking-widest mb-2.5"
                            style={{ color: '#B8B8B0' }}
                          >
                            {category.replace(/-/g, ' ')}
                          </p>
                          <div className="space-y-2">
                            {addOns.map((addOn) => {
                              const selected = selectedAddOns.find(a => a.id === addOn.id);
                              return (
                                <div
                                  key={addOn.id}
                                  className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200"
                                  style={{
                                    background: selected ? 'rgba(30,58,138,0.05)' : '#fff',
                                    border: `1.5px solid ${selected ? 'rgba(30,58,138,0.2)' : '#EAEAE6'}`,
                                  }}
                                >
                                  <div>
                                    <div className="font-medium text-sm" style={{ color: '#1E1E1E' }}>
                                      {addOn.name}
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#AAA' }}>
                                      {addOn.price > 0 ? `+₱${addOn.price.toFixed(0)}` : 'Free'}
                                    </div>
                                  </div>

                                  {selected ? (
                                    <div
                                      className="flex items-center gap-1 rounded-xl p-1"
                                      style={{ background: 'rgba(30,58,138,0.1)' }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => updateAddOnQuantity(addOn, selected.quantity - 1)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90"
                                        style={{ background: '#1E3A8A', color: '#fff' }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span
                                        className="w-6 text-center text-sm font-bold"
                                        style={{ color: '#8B4513' }}
                                      >
                                        {selected.quantity}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => updateAddOnQuantity(addOn, selected.quantity + 1)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90"
                                        style={{ background: '#1E3A8A', color: '#fff' }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => updateAddOnQuantity(addOn, 1)}
                                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95"
                                      style={{ background: '#1E3A8A', color: '#fff' }}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                      Add
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Suggested Items */}
                {suggestedItems.length > 0 && (
                  <div className="mb-6 mt-2">
                    <div className="mb-3">
                      <h3
                        className="font-semibold text-base"
                        style={{ color: '#1E1E1E', letterSpacing: '-0.01em' }}
                      >
                        You might also like
                      </h3>
                    </div>
                    <div
                      className="flex gap-3 pb-2"
                      style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
                    >
                      {suggestedItems.map((s) => {
                        const sCartQty = cartItems.find(c => c.id === s.id)?.quantity || 0;
                        const displayPrice = s.effectivePrice ?? s.basePrice;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              if (s.variations?.length || s.addOns?.length) {
                                // add 1 to cart; they can open it from menu to customize
                                onAddToCart(s, 1);
                              } else {
                                onAddToCart(s, 1);
                              }
                            }}
                            className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden text-left transition-all duration-200 active:scale-95"
                            style={{
                              width: '130px',
                              background: '#fff',
                              border: '1.5px solid #EAEAE6',
                              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                            }}
                          >
                            {/* Image */}
                            <div className="relative overflow-hidden" style={{ height: '88px' }}>
                              {s.image ? (
                                <img
                                  src={s.image}
                                  alt={s.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ background: 'linear-gradient(135deg, rgba(139,69,19,0.1), rgba(160,82,45,0.2))' }}
                                >
                                  <span className="text-2xl opacity-30">☕</span>
                                </div>
                              )}
                              {sCartQty > 0 && (
                                <div
                                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                  style={{ background: '#1E3A8A' }}
                                >
                                  {sCartQty}
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="p-2.5">
                              <div
                                className="font-medium leading-tight mb-1"
                                style={{
                                  color: '#1E1E1E',
                                  fontSize: '12px',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {s.name}
                              </div>
                              <div className="flex items-center justify-between">
                                <span style={{ color: '#888', fontSize: '11px' }}>
                                  ₱{displayPrice.toFixed(0)}
                                </span>
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: '#1E3A8A' }}
                                >
                                  <Plus className="h-2.5 w-2.5 text-white" />
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky bottom bar */}
              <div
                className="flex-shrink-0 flex items-center gap-4 px-5"
                style={{
                  background: '#FAFAF8',
                  borderTop: '1px solid #EAEAE6',
                  paddingTop: '16px',
                  paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                }}
              >
                <div className="flex-shrink-0">
                  <div className="text-xs font-medium mb-0.5" style={{ color: '#AAA' }}>Total</div>
                  <div
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: '#1E1E1E', fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    ₱{calculatePrice().toFixed(0)}
                  </div>
                </div>
                <button
                  onClick={handleCustomizedAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 cafero-btn-primary"
                  style={{
                    background: '#8B4513',
                    color: '#fff',
                    boxShadow: '0 4px 22px rgba(139,69,19,0.38)',
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>
            </div>

            <style>{`
            @keyframes ccSlideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          </div>
        );
      })()}
    </>
  );
};

export default MenuItemCard;