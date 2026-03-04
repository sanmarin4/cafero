import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  const [pendingRemoval, setPendingRemoval] = React.useState<string | null>(null);

  const confirmRemove = () => {
    if (pendingRemoval) {
      removeFromCart(pendingRemoval);
      setPendingRemoval(null);
    }
  };

  const cancelRemove = () => setPendingRemoval(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onContinueShopping}
          className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Continue Shopping</span>
        </button>

        <h1 className="text-3xl font-semibold text-amber-900">
          Your Cart
        </h1>

        <button
          onClick={clearCart}
          className={`text-red-500 hover:text-red-600 transition-colors duration-200 ${
            cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={cartItems.length === 0}
        >
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white rounded-xl shadow-md p-12 border border-amber-200 text-center mb-8">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5-2.5M7 13v6a1 1 0 001 1h8a1 1 0 001-1v-6m-9 0h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-amber-900 mb-2">Your cart is empty</h3>
            <p className="text-amber-700 mb-6">Add some delicious items to get started!</p>
            <button
              onClick={onContinueShopping}
              className="bg-amber-800 text-white px-8 py-3 rounded-xl hover:bg-amber-900 transition-all duration-200 transform hover:scale-[1.02] font-semibold"
            >
              Start Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-amber-200">
          {cartItems.map((item, index) => (
          <div
            key={item.id}
            className={`p-6 ${
              index !== cartItems.length - 1
                ? 'border-b border-amber-100'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-1">
                  {item.name}
                </h3>

                {(item.selectedVariations && item.selectedVariations.length > 0
                  ? item.selectedVariations
                  : item.selectedVariation
                  ? [item.selectedVariation]
                  : []
                ).map(v => (
                  <p
                    key={v.id}
                    className="text-sm text-amber-700 mb-0.5"
                  >
                    {v.type ? `${v.type}: ` : ''}{v.name}
                  </p>
                ))}

                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-amber-700 mb-1">
                    Add-ons:{' '}
                    {item.selectedAddOns.map(addOn =>
                      addOn.quantity && addOn.quantity > 1
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}

                <p className="text-lg font-semibold text-amber-800">
                  ₱{item.totalPrice} each
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-4 ml-4">
                <div className="flex items-center space-x-3 bg-amber-50 rounded-full p-1 border border-amber-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-amber-200 rounded-full transition-colors duration-200"
                  >
                    <Minus className="h-4 w-4 text-amber-800" />
                  </button>

                  <span className="font-semibold text-amber-900 min-w-[32px] text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-amber-200 rounded-full transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 text-amber-800" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-amber-900">
                    ₱{(item.totalPrice * item.quantity).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => setPendingRemoval(item.id)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Total Section - Only show when cart has items */}
      {cartItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-amber-200">
          <div className="flex items-center justify-between text-2xl font-semibold text-amber-900 mb-6">
            <span>Total:</span>
            <span className="text-amber-800">
              ₱{getTotalPrice().toFixed(2)}
            </span>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-amber-800 text-white py-4 rounded-xl hover:bg-amber-900 transition-all duration-200 transform hover:scale-[1.02] text-lg font-semibold"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* confirmation modal */}
      {pendingRemoval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold text-amber-900 mb-4">Remove item?</h2>
            <p className="text-amber-700 mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;