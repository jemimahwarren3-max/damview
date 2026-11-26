"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { changeGuestRoom } from "@/lib/actions/guests";
import { Database } from "@/types/database.types";
import {
  LogOut,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Phone,
  CreditCard,
  User,
  Search,
  Printer,
  FileText,
  Download,
  ArrowRightLeft,
  X,
  BedDouble,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

type Guest = Database["public"]["Tables"]["guests"]["Row"] & {
  rooms: { room_number: number; type: string };
};

type AvailableRoom = {
  id: string;
  room_number: number;
  type: string;
  base_price: number;
};

// ── Upgrade Room Modal ──────────────────────────────────────────────────────
function UpgradeRoomModal({
  guest,
  availableRooms,
  onClose,
  onConfirm,
}: {
  guest: Guest;
  availableRooms: AvailableRoom[];
  onClose: () => void;
  onConfirm: (room: AvailableRoom, reason: string, gstPercent: number) => void;
}) {
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);
  const [reason, setReason] = useState("");
  const [gstPercent, setGstPercent] = useState(String(guest.gst_percent ?? 12));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-sm w-full max-w-md animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">Room Shift</h3>
              <p className="text-xs text-neutral-500">
                Moving:{" "}
                <span className="font-semibold text-neutral-700">
                  {guest.name}
                </span>{" "}
                from Room{" "}
                <span className="font-semibold text-neutral-700">
                  {guest.rooms?.room_number}
                </span>
              </p>
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                ⚠️ Billing stays under original room
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {availableRooms.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <BedDouble className="h-7 w-7 text-neutral-300" />
              </div>
              <p className="font-semibold text-neutral-700">No rooms available</p>
              <p className="text-xs text-neutral-400 mt-1">
                All rooms are currently occupied or under cleaning.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Select a new room
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                        isSelected
                          ? "border-neutral-500 bg-neutral-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-base flex-shrink-0 ${
                          isSelected
                            ? "bg-neutral-500 text-white"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {room.room_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-sm ${isSelected ? "text-neutral-900" : "text-neutral-800"}`}
                        >
                          Room {room.room_number}
                        </p>
                        <p
                          className={`text-xs capitalize ${isSelected ? "text-neutral-600" : "text-neutral-500"}`}
                        >
                          {room.type}
                        </p>
                      </div>
                      <div
                        className={`text-right flex-shrink-0 ${isSelected ? "text-neutral-700" : "text-neutral-600"}`}
                      >
                        <p className="font-semibold text-sm">
                          ${Number(room.base_price).toLocaleString('en-US')}
                        </p>
                        <p className="text-[10px] text-neutral-400">/night</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                          isSelected
                            ? "border-neutral-500 bg-neutral-500"
                            : "border-neutral-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            className="w-full h-full"
                          >
                            <path
                              d="M3.5 8L6.5 11L12.5 5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tax field */}
              <div className="mt-3">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Tax Rate for new room (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(e.target.value)}
                  placeholder="e.g. 15"
                  className="premium-input"
                />
              </div>

              {/* Reason field */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Reason for shift (optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Guest requested upgrade, AC issue..."
                  className="premium-input"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {availableRooms.length > 0 && (
          <div className="flex gap-3 px-5 pb-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedRoom && onConfirm(selectedRoom, reason, parseFloat(gstPercent) || 0)}
              disabled={!selectedRoom}
              className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-600 text-white text-sm font-bold hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-neutral-200"
            >
              {selectedRoom
                ? `Move to Room ${selectedRoom.room_number}`
                : "Select a room"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── GuestList ───────────────────────────────────────────────────────────────
export default function GuestList({
  guests,
  isSuperAdmin = false,
  availableRooms = [],
}: {
  guests: Guest[];
  isSuperAdmin?: boolean;
  availableRooms?: AvailableRoom[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [upgradeTarget, setUpgradeTarget] = useState<Guest | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );
  const { confirm } = useConfirm();

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  const handleChangeRoom = async (
    selectedRoom: AvailableRoom,
    reason: string,
    newGstPercent: number,
  ) => {
    if (!upgradeTarget) return;
    setUpgradeTarget(null);

    const confirmed = await confirm({
      title: "Confirm Room Shift",
      message: `Transfer ${upgradeTarget.name} to Room ${selectedRoom.room_number} (${selectedRoom.type})? Their billing rate will update to $${Number(selectedRoom.base_price).toLocaleString('en-US')}/night at ${newGstPercent}% Tax. Billing will continue under the original room.${reason ? ` Reason: ${reason}` : ""}`,
      confirmText: "Yes, Shift Room",
      variant: "warning",
    });

    if (!confirmed) return;
    setLoadingId(upgradeTarget.id);

    const { error } = await changeGuestRoom(
      upgradeTarget.id,
      upgradeTarget.room_id!,
      String(selectedRoom.room_number),
      reason,
      newGstPercent,
    );
    if (error) {
      toast.error("Room shift failed: " + error);
    } else {
      toast.success(
        `${upgradeTarget.name} has been shifted to Room ${selectedRoom.room_number}!`,
      );
    }
    setLoadingId(null);
  };

  const handlePrintRegCard = (guest: Guest) => {
    const otherNames = guest.other_guest_names || [];
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
 <html>
 <head>
 <title>Registration Card - ${guest.name}</title>
 <style>
 body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
 .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
 .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
 .field { margin-bottom: 15px; }
 .label { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; }
 .value { font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
 .section-title { background: #f4f4f4; padding: 5px 10px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
 .footer { margin-top: 50px; display: flex; justify-content: space-between; }
 .sign-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 5px; margin-top: 50px; }
 </style>
 </head>
 <body>
 <div class="header">
 <h1>GUEST REGISTRATION CARD</h1>
 <p>Hotel Management System | Guest Code: ${guest.guest_code || "N/A"}</p>
 </div>
 
 <div class="grid">
 <div class="field"><div class="label">Primary Guest</div><div class="value">${guest.name}</div></div>
 <div class="field"><div class="label">Room Number</div><div class="value">${guest.rooms?.room_number} (${guest.rooms?.type})</div></div>
 <div class="field"><div class="label">Phone Number</div><div class="value">${guest.phone || "N/A"}</div></div>
 <div class="field"><div class="label">Check-in Date</div><div class="value">${new Date(guest.check_in).toLocaleString('en-US')}</div></div>
 <div class="field"><div class="label">ID Proof Type</div><div class="value">${guest.id_proof_name || "N/A"}</div></div>
 <div class="field"><div class="label">ID Proof Number</div><div class="value">${guest.id_proof_number || "N/A"}</div></div>
 </div>

 ${
   otherNames.length > 0
     ? `
 <div class="section-title">OTHER GUESTS (${otherNames.length})</div>
 <ul>${otherNames.map((n: string) => `<li>${n}</li>`).join("")}</ul>
 `
     : ""
 }

 <div class="section-title">BILLING SUMMARY</div>
 <div class="grid">
 <div class="field"><div class="label">Daily Tariff</div><div class="value">$${Number(guest.rate).toLocaleString('en-US')}</div></div>
 <div class="field"><div class="label">Gst Rate</div><div class="value">${guest.gst_percent}%</div></div>
 </div>

 <div class="footer">
 <div class="sign-box">Guest Signature</div>
 <div class="sign-box">Manager/Front Desk</div>
 </div>
 
 <script>window.print();</script>
 </body>
 </html>
 `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getDaysStayed = (checkIn: string) => {
    return Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredGuests = guests.filter(
    (g) =>
      g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.rooms?.room_number.toString().includes(searchQuery) ||
      g.guest_code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Upgrade Room Modal - rendered via portal to avoid glass-card backdrop-filter trapping */}
      {upgradeTarget &&
        portalContainer &&
        createPortal(
          <UpgradeRoomModal
            guest={upgradeTarget}
            availableRooms={availableRooms}
            onClose={() => setUpgradeTarget(null)}
            onConfirm={handleChangeRoom}
          />,
          portalContainer,
        )}

      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search guests by name, room or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-400 transition-all text-neutral-900 placeholder:text-neutral-500 font-medium"
            />
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-neutral-50 text-neutral-900 text-xs font-bold border border-neutral-300">
            {filteredGuests.length} Active
          </div>
        </div>

        {filteredGuests.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto mb-5">
              <Search className="h-10 w-10 text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-semibold text-lg">
              No guests found
            </p>
            <p className="text-neutral-400 text-sm mt-1">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-3 overflow-y-auto">
            {filteredGuests.map((guest) => {
              const days = getDaysStayed(guest.check_in);
              const isLoading = loadingId === guest.id;
              const isExpanded = expandedId === guest.id;
              const otherNames = guest.other_guest_names || [];

              return (
                <div
                  key={guest.id}
                  className="flex flex-col rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300/80 transition-all duration-200 shadow-sm overflow-hidden group"
                >
                  {/* Summary Row */}
                  <div className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-700 text-sm font-bold shadow-sm flex-shrink-0">
                      {guest.name?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-neutral-900 text-base">
                          {guest.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-50 text-neutral-900 text-[11px] font-bold border border-neutral-300">
                          🛏️ {guest.rooms?.room_number}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${days >= 3 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                        >
                          <Clock className="h-3 w-3" />
                          {days}N
                        </span>
                      </div>
                    </div>

                    {/* Actions and Dropdown Toggle */}
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-neutral-900 text-sm">
                          ${Number(guest.rate).toLocaleString('en-US')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUpgradeTarget(guest)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors disabled:opacity-50 shadow-sm shadow-black/5"
                        >
                          Upgrade Room
                        </button>
                      </div>
                      <button
                        onClick={() => toggleExpand(guest.id)}
                        className="p-1.5 rounded-lg hover:bg-neutral-50 text-neutral-400 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-neutral-50 bg-neutral-50/30 animate-fade-in divide-y divide-neutral-100">
                      <div className="py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                        {/* Column 1: Codes & Stats */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex justify-between">
                            Stay Details
                            <button
                              onClick={() => handlePrintRegCard(guest)}
                              className="text-neutral-900 hover:text-neutral-800 flex items-center gap-1 normal-case font-bold"
                            >
                              <Printer className="h-3 w-3" /> Reg Card
                            </button>
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-600 font-medium">
                                Guest Code:
                              </span>
                              <span className="font-bold text-neutral-900">
                                {guest.guest_code || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-600 font-medium">
                                Check-in:
                              </span>
                              <span
                                className="font-medium text-neutral-700"
                                suppressHydrationWarning
                              >
                                {new Date(guest.check_in).toLocaleDateString()}{" "}
                                {new Date(guest.check_in).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-600 font-medium">
                                People:
                              </span>
                              <span className="font-bold text-neutral-700">
                                {guest.people_count}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: ID & Contact */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Contact & ID
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3 text-neutral-500" />
                              <span className="text-neutral-600 font-medium">
                                Phone:
                              </span>
                              <span className="font-bold text-neutral-700">
                                {guest.phone || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <CreditCard className="h-3 w-3 text-neutral-500" />
                              <span className="text-neutral-600 font-medium">
                                {guest.id_proof_name || "ID"}:
                              </span>
                              <span className="font-bold text-neutral-700">
                                {guest.id_proof_number || "—"}
                              </span>
                            </div>
                            {(guest as any).email && (
                              <div className="flex items-center gap-2 text-xs">
                                <FileText className="h-3 w-3 text-neutral-500" />
                                <span className="text-neutral-600 font-medium">
                                  Email:
                                </span>
                                <span className="font-bold text-neutral-700 truncate" title={(guest as any).email}>
                                  {(guest as any).email}
                                </span>
                              </div>
                            )}
                            {(guest as any).gst_number && (
                              <div className="flex items-center gap-2 text-xs">
                                <FileText className="h-3 w-3 text-neutral-500" />
                                <span className="text-neutral-600 font-medium">
                                  Tax No:
                                </span>
                                <span className="font-bold text-neutral-700">
                                  {(guest as any).gst_number}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Billing */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                            Billing Status
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-600 font-medium">
                                Daily Rate:
                              </span>
                              <span className="font-bold text-neutral-700">
                                ${Number(guest.rate).toLocaleString('en-US')}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-neutral-600 font-medium">
                                Tax:
                              </span>
                              <span className="font-bold text-emerald-600">
                                {guest.gst_percent}% Applied
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Guest Names (Other than primary) */}
                      {otherNames.length > 0 && (
                        <div className="py-3">
                          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                            Other Guests
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {otherNames.map((name: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-600 shadow-sm"
                              >
                                <User className="h-2.5 w-2.5 text-neutral-400" />
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

