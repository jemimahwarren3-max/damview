"use client";

import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { Database } from "@/types/database.types";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleNonBreakfastItems,
} from "@/lib/actions/menu";
import Resizer from "react-image-file-resizer";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Minus,
  Trash2,
  Package,
  ChevronDown,
  ChevronUp,
  Edit2,
  Utensils,
  Check,
  X,
  Search,
  Upload,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type MenuItem = Database["public"]["Tables"]["food_menu"]["Row"];

export default function MenuList({
  initialItems,
}: {
  initialItems: MenuItem[];
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Debounced stock update refs
  const stockTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const pendingStockValues = useRef<Map<string, number>>(new Map());
  const lastServerValues = useRef<Map<string, number>>(new Map());

  // Cleanup all pending timers on unmount
  useEffect(() => {
    return () => {
      stockTimers.current.forEach(timer => clearTimeout(timer));
      stockTimers.current.clear();
    };
  }, []);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<string>("0");
  const [newQuantity, setNewQuantity] = useState<string>("0");
  const [newIsBreakfast, setNewIsBreakfast] = useState(false);
  const [newBreakfastStart, setNewBreakfastStart] = useState("07:00");
  const [newBreakfastEnd, setNewBreakfastEnd] = useState("10:30");

  const { confirm } = useConfirm();

  // Compute whether non-breakfast items are currently enabled
  const nonBreakfastItems = items.filter((i) => !(i as any).is_breakfast);
  const nonBreakfastEnabled = nonBreakfastItems.length > 0 && nonBreakfastItems.some((i) => i.is_active);

  const handleToggleNonBreakfast = async () => {
    const newState = !nonBreakfastEnabled;
    const confirmed = await confirm({
      title: newState ? "Enable Non-Breakfast Items" : "Disable Non-Breakfast Items",
      message: newState
        ? "This will make all non-breakfast menu items visible to guests. Continue?"
        : "This will hide all non-breakfast menu items from guests until you re-enable them. Continue?",
      confirmText: newState ? "Enable All" : "Disable All",
      variant: newState ? "info" : "danger",
    });
    if (!confirmed) return;
    setLoadingId("toggle-nb");
    const { error } = await toggleNonBreakfastItems(newState);
    if (!error) {
      setItems(items.map((i) => (i as any).is_breakfast ? i : { ...i, is_active: newState }));
      toast.success(newState ? "Non-breakfast items enabled" : "Non-breakfast items disabled");
    } else {
      toast.error("Failed: " + error);
    }
    setLoadingId(null);
  };

  const handleUpdate = async (id: string, updates: Partial<MenuItem>) => {
    setLoadingId(id);
    const { error } = await updateMenuItem(id, updates);
    if (!error) {
      setItems(prev => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    } else {
      toast.error("Failed to update: " + error);
    }
    setLoadingId(null);
  };

  // Debounced stock update: optimistic UI + batched server call
  const handleStockUpdate = useCallback((id: string, newQty: number) => {
    const cleanQty = Math.max(0, newQty);

    // 1. Optimistic UI update — instant feedback
    setItems(prev => {
      // Store the last known server value for revert on error
      if (!lastServerValues.current.has(id)) {
        const currentItem = prev.find(i => i.id === id);
        if (currentItem) lastServerValues.current.set(id, currentItem.available_quantity);
      }
      return prev.map((i) => {
        if (i.id !== id) return i;
        pendingStockValues.current.set(id, cleanQty);
        return { ...i, available_quantity: cleanQty };
      });
    });

    // 2. Debounce the server call — accumulate rapid clicks
    const existingTimer = stockTimers.current.get(id);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      const finalQty = pendingStockValues.current.get(id);
      if (finalQty !== undefined) {
        startTransition(async () => {
          const { error } = await updateMenuItem(id, { available_quantity: finalQty });
          if (error) {
            // Revert to the last known server value
            const revertQty = lastServerValues.current.get(id) ?? finalQty;
            setItems(prev => prev.map(i => i.id === id ? { ...i, available_quantity: revertQty } : i));
            toast.error("Failed to update stock: " + error);
          } else {
            // Update last known server value on success
            lastServerValues.current.set(id, finalQty);
          }
          pendingStockValues.current.delete(id);
        });
      }
      stockTimers.current.delete(id);
    }, 500);

    stockTimers.current.set(id, timer);
  }, [startTransition]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Menu Item",
      message: "Are you sure you want to permanently delete this item?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    setLoadingId(id);
    const { error } = await deleteMenuItem(id);
    if (!error) {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item deleted");
    } else {
      toast.error("Failed to delete: " + error);
    }
    setLoadingId(null);
  };

  const handleImageUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingId(id);

    // Compress image to 800x800 WebP max, reducing size to ~100-200kb
    const resizeImage = (file: File): Promise<File> =>
      new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          800,
          800,
          "WEBP",
          85,
          0,
          (uri) => {
            resolve(uri as File);
          },
          "file"
        );
      });

    try {
      const compressedFile = await resizeImage(file);
      const supabase = createClient();
      const fileName = `${id}-${Date.now()}.webp`;

      toast.loading("Uploading image...", { id: "upload" });
      const { error: uploadError } = await supabase.storage
        .from("food_images")
        .upload(fileName, compressedFile, { upsert: true, cacheControl: "3600" });

      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message, { id: "upload" });
        setLoadingId(null);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("food_images").getPublicUrl(fileName);
      await handleUpdate(id, { image_url: publicUrl } as any);
      toast.success("Image uploaded successfully!", { id: "upload" });
    } catch (e: any) {
      toast.error("Error formatting image: " + e.message, { id: "upload" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingId("new");
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("price", newPrice);
    formData.append("available_quantity", newQuantity);
    formData.append("is_active", "true");
    formData.append("is_breakfast", newIsBreakfast ? "true" : "false");
    if (newIsBreakfast) {
      formData.append("breakfast_start_time", newBreakfastStart);
      formData.append("breakfast_end_time", newBreakfastEnd);
    }
    const { error } = await addMenuItem(formData);
    if (!error) {
      toast.success("Item added successfully!");
      window.location.reload();
    } else {
      toast.error("Failed to add: " + error);
    }
    setLoadingId(null);
  };

  const getStockLevel = (qty: number) => {
    if (qty === 0)
      return {
        label: "Out of Stock",
        bg: "bg-rose-50",
        text: "text-rose-600",
        dot: "bg-rose-500",
      };
    if (qty <= 5)
      return {
        label: "Low Stock",
        bg: "bg-amber-50",
        text: "text-amber-600",
        dot: "bg-amber-500",
      };
    return {
      label: "Available",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    };
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900/20 outline-none transition-all text-neutral-900 placeholder:text-neutral-500 font-medium"
          />
        </div>

        {/* Non-breakfast toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white">
          <span className="text-xs font-bold text-neutral-600 whitespace-nowrap">🍽️ Non-Breakfast</span>
          <button
            onClick={handleToggleNonBreakfast}
            disabled={loadingId === "toggle-nb" || nonBreakfastItems.length === 0}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-50 ${nonBreakfastEnabled ? "bg-emerald-500" : "bg-neutral-300"
              }`}
            title={nonBreakfastEnabled ? "Click to disable all non-breakfast items" : "Click to enable all non-breakfast items"}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${nonBreakfastEnabled ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isAdding
              ? "bg-neutral-200 text-neutral-700"
              : "bg-neutral-900 text-white shadow-sm shadow-neutral-200 hover:bg-black"
            }`}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? "Cancel" : "Add Item"}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-5 border-b border-neutral-300 bg-neutral-50/30 animate-fade-in shadow-inner">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="premium-input bg-white text-sm py-2"
                  placeholder="e.g. Masala Dosa"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="premium-input bg-white text-sm py-2"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5 ml-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="premium-input bg-white text-sm py-2"
                />
              </div>
              <button
                disabled={loadingId === "new"}
                type="submit"
                className="bg-neutral-900 text-white font-bold h-10 rounded-xl hover:bg-black transition-colors shadow-sm disabled:opacity-50"
              >
                {loadingId === "new" ? "Saving..." : "Create Item"}
              </button>
            </div>
            {/* Breakfast toggle */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsBreakfast}
                  onChange={(e) => setNewIsBreakfast(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-200"
                />
                <span className="text-xs font-bold text-neutral-600">
                  🌅 Breakfast Item
                </span>
              </label>
              {newIsBreakfast && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    Available
                  </span>
                  <input
                    type="time"
                    value={newBreakfastStart}
                    onChange={(e) => setNewBreakfastStart(e.target.value)}
                    className="premium-input bg-white text-xs py-1 px-2 w-28"
                  />
                  <span className="text-xs text-neutral-400">to</span>
                  <input
                    type="time"
                    value={newBreakfastEnd}
                    onChange={(e) => setNewBreakfastEnd(e.target.value)}
                    className="premium-input bg-white text-xs py-1 px-2 w-28"
                  />
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Menu List */}
      <div className="p-5">
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <Utensils className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
            <p className="text-neutral-500 font-medium">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const stock = getStockLevel(item.available_quantity);
              const isLoading = loadingId === item.id;
              const isExpanded = expandedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col rounded-xl border transition-all duration-300 overflow-hidden group shadow-sm ${!item.is_active
                      ? "bg-neutral-50 border-neutral-200 opacity-80"
                      : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                >
                  {(item as any).image_url ? (
                    <img
                      src={(item as any).image_url}
                      alt={item.name}
                      className="aspect-square w-full object-cover bg-neutral-100"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-neutral-100 flex items-center justify-center text-neutral-500 border-b border-neutral-200">
                      <Utensils className="h-10 w-10 opacity-20" />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-neutral-900 text-lg leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        {(item as any).is_breakfast && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                            🌅 Breakfast
                          </span>
                        )}
                        {!item.is_active && (
                          <span className="text-[10px] font-bold bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded text-center">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-neutral-700">
                        ${Number(item.price).toLocaleString("en-US")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${stock.bg} ${stock.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                        {item.available_quantity} {stock.label}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 transition-colors text-xs font-bold"
                    >
                      {isExpanded ? "Hide" : "Manage"}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-neutral-200/70 bg-white/90 animate-fade-in space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Quick Stock Update
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockUpdate(item.id, item.available_quantity - 1)}
                            disabled={item.available_quantity <= 0}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-600 shadow-sm transition-all active:scale-90 flex-shrink-0"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.available_quantity === 0 ? "" : item.available_quantity}
                            onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-16 premium-input text-center text-sm font-bold bg-white py-1.5 px-1"
                          />
                          <button
                            onClick={() => handleStockUpdate(item.id, item.available_quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-600 shadow-sm transition-all active:scale-90 flex-shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Visibility
                        </p>
                        <button
                          onClick={() =>
                            handleUpdate(item.id, {
                              is_active: !item.is_active,
                            })
                          }
                          disabled={isLoading}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${item.is_active ? "bg-emerald-500" : "bg-neutral-300"}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${item.is_active ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          Food Image
                        </p>
                        <div className="relative flex items-center gap-2">
                          <label
                            className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 text-xs font-bold text-neutral-700 bg-white shadow-sm transition-all ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {(item as any).image_url
                              ? "Replace"
                              : "Upload Image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(item.id, e)}
                            />
                          </label>
                          {(item as any).image_url && (
                            <button
                              onClick={() =>
                                handleUpdate(item.id, {
                                  image_url: null,
                                } as any)
                              }
                              className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                              title="Remove Image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Item
                      </button>

                      <div className="space-y-2 pt-3 border-t border-neutral-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(item as any).is_breakfast || false}
                            onChange={(e) =>
                              handleUpdate(item.id, {
                                is_breakfast: e.target.checked,
                                ...(e.target.checked
                                  ? {
                                    breakfast_start_time: "07:00",
                                    breakfast_end_time: "10:30",
                                  }
                                  : {}),
                              } as any)
                            }
                            disabled={isLoading}
                            className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-200"
                          />
                          <span className="text-xs font-bold text-neutral-600">
                            🌅 Breakfast Item
                          </span>
                        </label>
                        {(item as any).is_breakfast && (
                          <div className="flex items-center gap-2 flex-wrap animate-fade-in">
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase">
                              Available
                            </span>
                            <input
                              type="time"
                              value={
                                (item as any).breakfast_start_time || "07:00"
                              }
                              onChange={(e) =>
                                handleUpdate(item.id, {
                                  breakfast_start_time: e.target.value,
                                } as any)
                              }
                              disabled={isLoading}
                              className="premium-input bg-white text-xs py-1 px-2 w-28"
                            />
                            <span className="text-xs text-neutral-400">to</span>
                            <input
                              type="time"
                              value={(item as any).breakfast_end_time || "10:30"}
                              onChange={(e) =>
                                handleUpdate(item.id, {
                                  breakfast_end_time: e.target.value,
                                } as any)
                              }
                              disabled={isLoading}
                              className="premium-input bg-white text-xs py-1 px-2 w-28"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

