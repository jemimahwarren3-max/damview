"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Plus, Minus, Send, Loader2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { placeOrder } from "@/lib/actions/publicOrder";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  is_active: boolean;
  available_quantity: number;
};

type CartItem = {
  food_id: string;
  name: string;
  quantity: number;
  price: number;
};

export default function MenuOrder({
  menu,
  roomId,
  tableId,
  locationLabel,
  guestCode,
}: {
  menu: MenuItem[];
  roomId: string | null;
  tableId: string | null;
  locationLabel: string;
  guestCode: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPending, startTransition] = useTransition();

  const categories = [...new Set(menu.map((m) => m.category))];
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.food_id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.food_id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { food_id: item.id, name: item.name, quantity: 1, price: item.price }];
    });
  }

  function updateQty(foodId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.food_id === foodId ? { ...c, quantity: c.quantity + delta } : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }

  function handleSubmit() {
    if (cart.length === 0) return;
    startTransition(async () => {
      const payload = cart.map((c) => ({
        food_id: c.food_id,
        quantity: c.quantity,
        price: c.price,
      }));
      const result = await placeOrder(roomId, guestCode, payload, "automatic", tableId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCart([]);
        setShowCart(false);
        setOrderPlaced(true);
      }
    });
  }

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Order Placed!</h2>
        <p className="text-neutral-500 mb-6">
          Your order has been sent to the kitchen. You'll be served shortly.
        </p>
        <button
          onClick={() => setOrderPlaced(false)}
          className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm"
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur border-b border-neutral-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Damview Resort</h1>
            <p className="text-xs text-neutral-500">{locationLabel}</p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative p-2.5 rounded-xl bg-neutral-900 text-white"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-20 flex flex-col">
          <div className="flex-1 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="bg-white rounded-t-2xl p-5 max-h-[70dvh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neutral-900">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-neutral-400 text-sm py-8 text-center">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.food_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.food_id, -1)}
                          className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.food_id, 1)}
                          className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-200 pt-3 flex items-center justify-between mb-4">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-bold text-lg text-neutral-900">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isPending ? "Placing Order…" : "Place Order"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              {cat}
            </h2>
            <div className="space-y-2">
              {menu
                .filter((m) => m.category === cat)
                .map((item) => {
                  const inCart = cart.find((c) => c.food_id === item.id);
                  const soldOut = item.available_quantity <= 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl bg-white border border-neutral-200 ${soldOut ? "opacity-50" : ""}`}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium text-sm text-neutral-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold text-neutral-700">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      {soldOut ? (
                        <span className="text-[10px] font-bold uppercase text-red-500">
                          Sold out
                        </span>
                      ) : inCart ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-10">
          <button
            onClick={() => setShowCart(true)}
            className="w-full max-w-lg mx-auto flex items-center justify-between py-3.5 px-5 rounded-2xl bg-neutral-900 text-white shadow-lg"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="w-4 h-4" />
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
            <span className="font-bold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
