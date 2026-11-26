"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  ChefHat,
  ArrowRight,
  Loader2,
  Clock,
  UtensilsCrossed,
  BedDouble,
  Armchair,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  acceptOrder,
  advanceOrderStatus,
  rejectOrder,
  rejectOrderItem,
} from "@/lib/actions/orders";
import { placeOrder } from "@/lib/actions/publicOrder";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id: string;
  food_id: string | null;
  custom_name: string | null;
  quantity: number;
  price_snapshot: number;
  food_menu: { name: string } | null;
};

type Order = {
  id: string;
  room_id: string | null;
  table_id: string | null;
  status: string;
  entry_mode: string;
  created_at: string;
  order_items: OrderItem[];
  rooms: { room_number: number } | null;
  restaurant_tables: { table_number: number } | null;
};

const STATUS_COLUMNS = [
  { key: "pending", label: "Pending", color: "bg-amber-50 border-amber-200" },
  {
    key: "accepted",
    label: "Accepted",
    color: "bg-blue-50 border-blue-200",
  },
  {
    key: "preparing",
    label: "Preparing",
    color: "bg-violet-50 border-violet-200",
  },
  {
    key: "prepared",
    label: "Ready",
    color: "bg-emerald-50 border-emerald-200",
  },
  {
    key: "served",
    label: "Served",
    color: "bg-neutral-50 border-neutral-200",
  },
];

export default function OrderBoard({
  initialOrders,
  role,
}: {
  initialOrders: Order[];
  role: string;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "room" | "table">("all");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrderType, setNewOrderType] = useState<"room" | "table">("table");
  const [newOrderTarget, setNewOrderTarget] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [cart, setCart] = useState<{ food_id: string; name: string; quantity: number; price: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (!showNewOrder) return;
    const supabase = createClient();
    if (!supabase) return;

    supabase.from("food_menu").select("id, name, price").eq("is_active", true).order("name").then(({ data }) => {
      if (data) setMenuItems(data);
    });
  }, [showNewOrder]);

  useEffect(() => {
    if (!showNewOrder) return;
    const supabase = createClient();
    if (!supabase) return;

    if (newOrderType === "table") {
      supabase.from("restaurant_tables").select("id, table_number").order("table_number").then(({ data }) => {
        if (data) setTargets(data);
      });
    } else {
      supabase.from("rooms").select("id, room_number").eq("status", "occupied").order("room_number").then(({ data }) => {
        if (data) setTargets(data);
      });
    }
    setNewOrderTarget("");
  }, [showNewOrder, newOrderType]);

  function addToCart(item: any) {
    setCart((prev) => {
      const existing = prev.find((c) => c.food_id === item.id);
      if (existing) return prev.map((c) => c.food_id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { food_id: item.id, name: item.name, quantity: 1, price: Number(item.price) }];
    });
  }

  async function handleSubmitOrder() {
    if (!newOrderTarget) return toast.error("Select a room or table.");
    if (cart.length === 0) return toast.error("Add at least one item.");

    setSubmitting(true);
    const cartPayload = cart.map((c) => ({ food_id: c.food_id, quantity: c.quantity, price: c.price }));
    const result = newOrderType === "table"
      ? await placeOrder(null, "STAFF_KOT", cartPayload, "manual", newOrderTarget)
      : await placeOrder(newOrderTarget, "ADMIN_OVERRIDE", cartPayload, "manual", null);
    setSubmitting(false);

    if (result.error) return toast.error(result.error);
    toast.success("Order placed");
    setShowNewOrder(false);
    setCart([]);
    setNewOrderTarget("");
    startTransition(() => router.refresh());
  }

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          startTransition(() => router.refresh());
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, startTransition]);

  const filtered = orders.filter((o) => {
    if (filter === "room") return o.room_id !== null;
    if (filter === "table") return o.table_id !== null;
    return true;
  });

  async function handleAccept(orderId: string) {
    setActionLoading(orderId);
    const result = await acceptOrder(orderId);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success("Order accepted");
    startTransition(() => router.refresh());
  }

  async function handleReject(orderId: string) {
    setActionLoading(orderId);
    const result = await rejectOrder(orderId);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success("Order rejected");
    startTransition(() => router.refresh());
  }

  async function handleRejectItem(orderId: string, itemId: string) {
    setActionLoading(itemId);
    const result = await rejectOrderItem(orderId, itemId);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    toast.success("Item removed");
    startTransition(() => router.refresh());
  }

  async function handleAdvance(orderId: string, currentStatus: string) {
    setActionLoading(orderId);
    const result = await advanceOrderStatus(orderId, currentStatus);
    setActionLoading(null);
    if (result.error) return toast.error(result.error);
    startTransition(() => router.refresh());
  }

  function timeSince(dateStr: string) {
    const mins = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000,
    );
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="seg-group">
        {(
          [
            { key: "all", label: "All Orders" },
            { key: "room", label: "Room Orders" },
            { key: "table", label: "Table Orders" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            className={`seg-item ${filter === tab.key ? "active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New order button */}
      {role !== "kitchen" && (
        <div className="flex justify-end">
          <button
            onClick={() => { setShowNewOrder(!showNewOrder); setCart([]); }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Manual KOT
          </button>
        </div>
      )}

      {/* New order form */}
      {showNewOrder && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm">New Manual Order</h3>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Type</label>
              <select
                value={newOrderType}
                onChange={(e) => setNewOrderType(e.target.value as "room" | "table")}
                className="premium-select"
              >
                <option value="table">Restaurant Table</option>
                <option value="room">Hotel Room</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-neutral-500 mb-1">
                {newOrderType === "table" ? "Table" : "Room (occupied)"}
              </label>
              <select
                value={newOrderTarget}
                onChange={(e) => setNewOrderTarget(e.target.value)}
                className="premium-select w-full"
              >
                <option value="">Select...</option>
                {targets.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {newOrderType === "table" ? `Table ${t.table_number}` : `Room ${t.room_number}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu items grid */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2">Menu Items</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {menuItems.map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="text-left p-2 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-xs"
                >
                  <span className="font-semibold text-neutral-800 block truncate">{item.name}</span>
                  <span className="text-neutral-400">${Number(item.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="bg-neutral-50 rounded-lg p-3 space-y-1">
              <h4 className="text-xs font-bold text-neutral-600 mb-1">Cart</h4>
              {cart.map((c) => (
                <div key={c.food_id} className="flex items-center justify-between text-xs">
                  <span>{c.quantity}x {c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">${(c.price * c.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => setCart((prev) => prev.filter((p) => p.food_id !== c.food_id))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-1 mt-1 flex justify-between text-xs font-bold">
                <span>Total</span>
                <span>${cart.reduce((s, c) => s + c.price * c.quantity, 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmitOrder}
              disabled={submitting || cart.length === 0}
              className="btn-primary flex items-center gap-1 text-sm"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Place Order
            </button>
            <button onClick={() => setShowNewOrder(false)} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const colOrders = filtered.filter((o) => o.status === col.key);
          return (
            <div key={col.key} className="space-y-2">
              <div
                className={`rounded-xl border px-3 py-2 ${col.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                    {col.label}
                  </h3>
                  <span className="text-xs font-bold text-neutral-400">
                    {colOrders.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isLoading={actionLoading === order.id}
                    itemLoading={actionLoading}
                    onAccept={() => handleAccept(order.id)}
                    onReject={() => handleReject(order.id)}
                    onRejectItem={(itemId) =>
                      handleRejectItem(order.id, itemId)
                    }
                    onAdvance={() =>
                      handleAdvance(order.id, order.status)
                    }
                    timeSince={timeSince}
                  />
                ))}
                {colOrders.length === 0 && (
                  <div className="text-center py-8 text-neutral-300 text-xs">
                    No orders
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  isLoading,
  itemLoading,
  onAccept,
  onReject,
  onRejectItem,
  onAdvance,
  timeSince,
}: {
  order: Order;
  isLoading: boolean;
  itemLoading: string | null;
  onAccept: () => void;
  onReject: () => void;
  onRejectItem: (itemId: string) => void;
  onAdvance: () => void;
  timeSince: (d: string) => string;
}) {
  const isRoom = order.room_id !== null;
  const location = isRoom
    ? `Room ${order.rooms?.room_number}`
    : `Table ${order.restaurant_tables?.table_number}`;

  const nextLabel: Record<string, string> = {
    accepted: "Start Prep",
    preparing: "Mark Ready",
    prepared: "Mark Served",
  };

  return (
    <div className="glass-card p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
          {isRoom ? (
            <BedDouble className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <Armchair className="h-3.5 w-3.5 text-violet-500" />
          )}
          {location}
        </div>
        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
          <Clock className="h-3 w-3" />
          {timeSince(order.created_at)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1">
        {order.order_items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-neutral-700">
              <span className="font-bold">{item.quantity}x</span>{" "}
              {item.food_menu?.name || item.custom_name || "Unknown"}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-neutral-400">
                ${(item.price_snapshot * item.quantity).toFixed(2)}
              </span>
              {order.status === "pending" &&
                order.order_items.length > 1 && (
                  <button
                    onClick={() => onRejectItem(item.id)}
                    disabled={itemLoading === item.id}
                    className="p-0.5 rounded text-neutral-300 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    {itemLoading === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {order.entry_mode === "manual" && (
        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
          Manual KOT
        </span>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 pt-1">
        {order.status === "pending" && (
          <>
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Accept
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="btn-danger text-xs py-1.5 px-3 flex items-center justify-center gap-1"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        )}
        {nextLabel[order.status] && (
          <button
            onClick={onAdvance}
            disabled={isLoading}
            className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowRight className="h-3 w-3" />
            )}
            {nextLabel[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}
